// styles are linked in index.html

const app = document.getElementById('app');

app.innerHTML = `
  <main>
    <section class="hero">
      <h1>Cold Kindred</h1>
      <p class="tagline">A procedural cold case investigation.</p>
      <button id="start" class="start">Start Investigation</button>
    </section>
  </main>
`;

document.getElementById('start').addEventListener('click', () => {
  alert('Simulation coming soon.');
});


