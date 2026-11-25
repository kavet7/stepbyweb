const menu = document.querySelector("nav");
const menuButton = document.querySelector(".menu-btn");
function toggleMenu(open) {
  menu.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
}
menuButton.addEventListener("click", () =>
  toggleMenu(!menu.classList.contains("open")),
);
menu.addEventListener("click", () => toggleMenu(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    toggleMenu(false);
    menuButton.focus();
  }
});

const cases = {
  mera: {
    title: "Бюро «Мера»",
    task: "В исходном каталоге здания, интерьеры и чертежи выглядели одинаково. Посетителю было трудно понять специализацию бюро.",
    solution:
      "Построили страницу вокруг фотографии объекта. Для проекта предусмотрели план, площадь, материалы и рассказ архитектора.",
    result:
      "В прототипе посетитель может оценить подход бюро по одному объекту и перейти к обсуждению своего проекта.",
  },
  sever: {
    title: "Маршруты «Север»",
    task: "Собрать маршруты по Карелии в одном месте, чтобы путешественник мог выбрать поездку под свой опыт.",
    solution:
      "Спроектировали каталог и карточку маршрута с километражем, рельефом, ночёвками и перечнем снаряжения.",
    result:
      "В макете условия поездки собраны на одной странице. Вопрос организатору можно задать прямо из карточки маршрута.",
  },
};
const dialog = document.querySelector("#case-dialog");
const comparison = document.querySelector("#comparison");
const slider = comparison.querySelector("input");
function updateDivider() {
  slider.parentElement.style.setProperty("--split", slider.value + "%");
}
slider.addEventListener("input", updateDivider);
document.querySelectorAll("[data-case]").forEach((button) =>
  button.addEventListener("click", () => {
    const key = button.dataset.case;
    for (const [field, value] of Object.entries(cases[key])) {
      document.getElementById("case-" + field).textContent = value;
    }
    comparison.hidden = key !== "mera";
    document.querySelector("#case-photo").hidden = key === "mera";
    slider.value = "44";
    updateDivider();
    dialog.showModal();
    dialog.scrollTop = 0;
  }),
);
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    e.clientX < bounds.left ||
    e.clientX > bounds.right ||
    e.clientY < bounds.top ||
    e.clientY > bounds.bottom
  )
    dialog.close();
});
document
  .querySelector("#case-contact")
  .addEventListener("click", () => dialog.close());

const form = document.querySelector("#brief");
const feedback = form.querySelector(".feedback");
const send = form.querySelector("button[type=submit]");
let requestId = crypto.randomUUID();
form.addEventListener("input", () => {
  requestId = crypto.randomUUID();
  feedback.textContent = "";
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (send.disabled) return;
  const data = Object.fromEntries(new FormData(form));
  const id = requestId;
  form
    .querySelectorAll("input, textarea")
    .forEach((field) => (field.readOnly = true));
  send.disabled = true;
  send.textContent = "Отправляем…";
  feedback.classList.remove("error");
  feedback.textContent = "";
  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.ok)
      throw new Error(result.error || "Не удалось сохранить заявку.");
    form.reset();
    requestId = crypto.randomUUID();
    feedback.textContent =
      "Заявка принята. Свяжемся с вами по указанному контакту.";
  } catch (error) {
    feedback.classList.add("error");
    feedback.textContent =
      error.name === "Error"
        ? error.message
        : "Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.";
  } finally {
    send.disabled = false;
    send.textContent = "Отправить заявку";
    form
      .querySelectorAll("input, textarea")
      .forEach((field) => (field.readOnly = false));
  }
});

// Keep native summary keyboard activation and animate the panel's actual height.
for (const item of document.querySelectorAll(".service-list details")) {
  const panel = item.querySelector(".service-description");
  let motion;
  item.querySelector("summary").addEventListener("click", (event) => {
    if (!panel.animate) return;
    event.preventDefault();
    const opening = !item.open || item.classList.contains("closing");
    const height = item.open ? panel.getBoundingClientRect().height : 0;
    const opacity = item.open ? getComputedStyle(panel).opacity : 0;
    motion?.cancel();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      item.classList.remove("closing");
      item.open = opening;
      return;
    }
    item.open = true;
    item.classList.toggle("closing", !opening);
    motion = panel.animate(
      [{ height: height + "px", opacity },
       { height: (opening ? panel.scrollHeight : 0) + "px", opacity: opening ? 1 : 0 }],
      { duration: 270, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
    motion.onfinish = () => {
      item.open = opening;
      item.classList.remove("closing");
    };
  });
}
