const menu = document.querySelector('nav');
const menuButton = document.querySelector('.menu-btn');
function toggleMenu(open) {
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}
menuButton.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.addEventListener('click', () => toggleMenu(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    toggleMenu(false);
    menuButton.focus();
  }
});

const cases = {
  mera: {
    title: 'Бюро «Мера»',
    task: 'В исходном каталоге здания, интерьеры и чертежи выглядели одинаково. Посетителю было трудно понять специализацию бюро.',
    solution: 'Построили страницу вокруг фотографии объекта. Для проекта предусмотрели план, площадь, материалы и рассказ архитектора.',
    result: 'В прототипе посетитель может оценить подход бюро по одному объекту и перейти к обсуждению своего проекта.'
  },
  sever: {
    title: 'Маршруты «Север»',
    task: 'Собрать маршруты по Карелии в одном месте, чтобы путешественник мог выбрать поездку под свой опыт.',
    solution: 'Спроектировали каталог и карточку маршрута с километражем, рельефом, ночёвками и перечнем снаряжения.',
    result: 'В макете условия поездки собраны на одной странице. Вопрос организатору можно задать прямо из карточки маршрута.'
  }
};
const dialog = document.querySelector('#case-dialog');
const comparison = document.querySelector('#comparison');
const slider = comparison.querySelector('input');
function updateDivider() {
  slider.parentElement.style.setProperty('--split', slider.value + '%');
}
slider.addEventListener('input', updateDivider);
document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.case;
  for (const [field, value] of Object.entries(cases[key])) {
    document.getElementById('case-' + field).textContent = value;
  }
  comparison.hidden = key !== 'mera';
  document.querySelector('#case-photo').hidden = key === 'mera';
  slider.value = '44';
  updateDivider();
  dialog.showModal();
  dialog.scrollTop = 0;
}));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) dialog.close();
});
document.querySelector('#case-contact').addEventListener('click', () => dialog.close());
