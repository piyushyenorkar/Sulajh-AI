import https from 'https';

async function fetchLogo() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Paytm-Dark.svg');
    if (res.ok) {
      console.log('Skill icon status:', res.status);
    }
  } catch (e) {
    console.log('Error', e.message);
  }
}
fetchLogo();

