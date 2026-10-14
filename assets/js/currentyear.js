document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.currentyear').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
