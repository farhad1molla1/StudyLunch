export const getSubjectColor = (subject) => {
  const fallback = { 
    bg: 'var(--surface-cool)', 
    text: 'var(--text-main)', 
    border: 'var(--border-soft)', 
    accent: 'var(--border-soft)' 
  };
  
  if (!subject || typeof subject !== 'string') return fallback;

  const norm = subject.toLowerCase().trim();

  // CSE / Programming -> Teal/Sky
  if (norm.includes('cse') || norm.includes('computer') || norm.includes('programming') || norm.includes('software')) {
    return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', accent: '#38BDF8' };
  }
  // Math -> Lilac/Purple
  if (norm.includes('math') || norm.includes('calculus') || norm.includes('algebra')) {
    return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF', accent: '#A855F7' };
  }
  // English -> Mint/Emerald
  if (norm.includes('eng') || norm.includes('literature') || norm.includes('grammar')) {
    return { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0', accent: '#34D399' };
  }
  // Physics -> Cyan
  if (norm.includes('physics') || norm.includes('mechanics')) {
    return { bg: '#CFFAFE', text: '#0E7490', border: '#A5F3FC', accent: '#22D3EE' };
  }
  // Chemistry -> Orange/Apricot
  if (norm.includes('chem') || norm.includes('organic')) {
    return { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA', accent: '#FB923C' };
  }
  // Biology -> Soft Green
  if (norm.includes('bio') || norm.includes('botany') || norm.includes('zoology')) {
    return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', accent: '#4ADE80' };
  }
  // Bangla -> Rose/Pink
  if (norm.includes('bangla') || norm.includes('bengali') || norm.includes('bng')) {
    return { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8', accent: '#F472B6' };
  }
  // ICT -> Teal
  if (norm.includes('ict') || norm.includes('info')) {
    return { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4', accent: '#2DD4BF' };
  }
  // Business / Econ -> Indigo
  if (norm.includes('business') || norm.includes('econ') || norm.includes('accounting') || norm.includes('finance')) {
    return { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE', accent: '#818CF8' };
  }

  return fallback;
};