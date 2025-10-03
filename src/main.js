import './style.css';

const app = document.getElementById('app');

app.innerHTML = `
  <main>
    <h1>Cold Kindred</h1>
    <p>A procedural cold case investigation.</p>
    <button id="start">Start</button>
  </main>
`;

document.getElementById('start').addEventListener('click', () => {
    alert('Simulation coming soon.');
});


