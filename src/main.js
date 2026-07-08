const app = document.getElementById("app");

app.innerHTML = `
  <header class="hero">
    <h1 class="wordmark">
      <span class="wordmark-break">BREAK</span><span class="wordmark-even">EVEN</span>
    </h1>
    <p class="tagline">
      Where does self-hosting an open model beat paying per-token?
      Slide your monthly token volume and watch the crossover.
    </p>
    <p class="status-note">The calculator lands in the next build pass — see
      <a href="docs/BACKLOG.md">docs/BACKLOG.md</a> for the plan.</p>
  </header>
`;
