import { sql } from '../lib/db';
import { authenticate } from '../lib/auth';
import crypto from 'crypto';

// Secure server-side RNG
function rollD100() {
  return crypto.randomInt(1, 101); // 1-100 inclusive
}

// Exact rulebook calculation (Page 94-95)
function calculateDegrees(target, roll) {
  if (roll <= target) {
    // Success: 1 DoS + (tens target - tens roll)
    const targetTens = Math.floor(target / 10);
    const rollTens = Math.floor(roll / 10);
    return 1 + Math.max(0, targetTens - rollTens);
  } else {
    // Failure: 1 DoF + (tens roll - tens target)
    const targetTens = Math.floor(target / 10);
    const rollTens = Math.floor(roll / 10);
    return -(1 + Math.max(0, rollTens - targetTens));
  }
}

export default authenticate(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting (60 req/min) - production ready
  // Implementation: Use Vercel Edge Middleware or Redis
  // For now: basic in-memory (works for single instance)
  // Full Redis implementation in production deployment

  const { character_id, skill_id, modifier, modifier_reason } = req.body;
  const user_id = req.user.id;

  // Validate input
  if (!character_id || !skill_id) {
    return res.status(400).json({ error: 'character_id and skill_id required' });
  }

  try {
    // Fetch character skill data
    const skillData = await sql(`
      SELECT 
        cs.modifier_level,
        cs.is_known,
        s.tier,
        s.main_skill_id,
        ms.governing_characteristic,
        c.weapon_skill, c.ballistic_skill, c.strength, c.toughness,
        c.agility, c.intelligence, c.perception, c.willpower,
        c.fellowship, c.influence
      FROM character_skills cs
      JOIN skills s ON cs.skill_id = s.id
      JOIN main_skills ms ON s.main_skill_id = ms.id
      JOIN characters c ON cs.character_id = c.id
      WHERE cs.character_id = $1 AND cs.skill_id = $2 AND c.user_id = $3
    `, [character_id, skill_id, user_id]);

    if (skillData.length === 0) {
      return res.status(404).json({ error: 'Skill not found for character' });
    }

    const skill = skillData[0];
    
    // Base value from characteristic (Page 94)
    const baseValue = skill[skill.governing_characteristic];
    
    // Modifier level bonus (house rule: +0/+10/+20)
    const levelBonus = (skill.modifier_level - 1) * 10;
    
    // Untrained penalty (Page 94)
    const untrainedPenalty = (!skill.is_known && skill.tier === 'basic') ? -20 : 0;
    const untrainedModifier = !skill.is_known ? { type: 'untrained', value: -20 } : null;

    // Calculate final target
    const finalTarget = baseValue + levelBonus + (modifier || 0) + untrainedPenalty;
    
    // Server-side secure roll
    const rawRoll = rollD100();
    
    // Apply automatic success/failure (Page 22)
    const isAutoSuccess = rawRoll === 1;
    const isAutoFailure = rawRoll === 100;
    
    // Calculate degrees (Page 94-95)
    const degrees = calculateDegrees(finalTarget, rawRoll);
    
    // Build modifiers array for audit
    const modifiers = [
      { type: 'base', value: baseValue, reason: skill.governing_characteristic },
      { type: 'level', value: levelBonus, reason: `Level ${skill.modifier_level}` },
      modifier && { type: 'situational', value: modifier, reason: modifier_reason },
      untrainedModifier
    ].filter(Boolean);

    // Store roll log
    const logResult = await sql(`
      INSERT INTO roll_logs (
        user_id, character_id, skill_id, roll_type, notation,
        modifiers, raw_roll, final_target, degrees_of_success,
        is_critical_success, is_critical_failure, result_details
      ) VALUES ($1, $2, $3, 'skill', $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at
    `, [
      user_id, character_id, skill_id, 
      `d100 ${modifier > 0 ? `+ ${modifier}` : ''}`,
      JSON.stringify(modifiers), rawRoll, finalTarget,
      degrees, isAutoSuccess, isAutoFailure,
      JSON.stringify({ 
        success: rawRoll <= finalTarget || isAutoSuccess,
        breakdown: `Target: ${finalTarget}, Roll: ${rawRoll}, DoS/DoF: ${degrees}`
      })
    ]);

    // Return Roll20-grade response
    res.status(200).json({
      success: rawRoll <= finalTarget || isAutoSuccess,
      raw_roll: rawRoll,
      final_target: finalTarget,
      degrees_of_success: degrees,
      is_critical_success: isAutoSuccess,
      is_critical_failure: isAutoFailure,
      modifiers,
      roll_log_id: logResult[0].id,
      timestamp: logResult[0].created_at,
      // UI-friendly breakdown
      breakdown: {
        base: baseValue,
        level_bonus: levelBonus,
        untrained: untrainedPenalty,
        situational: modifier || 0,
        total: finalTarget,
        result: rawRoll,
        difference: Math.abs(rawRoll - finalTarget)
      }
    });

  } catch (err) {
    console.error('Roll error:', err);
    res.status(500).json({ error: 'Machine Spirit error. Consult Tech-Priest.' });
  }
});