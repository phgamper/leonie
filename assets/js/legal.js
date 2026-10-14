// Renders the Markdown files in content/ into the legal articles (AGB, Impressum, Datenschutz).
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-markdown]').forEach(function (article) {
    fetch(article.dataset.markdown, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (md) { article.innerHTML = marked.parse(md); })
      .catch(function () { article.textContent = 'Der Inhalt konnte nicht geladen werden.'; });
  });
});
