window.onload = function () {
  const textarea = document.querySelector('textarea');
  const form = document.querySelector('form');
  const dialogList = document.querySelector('.dialog__list');
  let hours = new Date().getHours();
  let minutes = new Date().getMinutes();

  scroll();

  textarea.addEventListener('keyup', function () {
    if (this.scrollTop > 0 && this.offsetHeight < 124) {
      this.style.height = this.scrollHeight + 2 + 'px';
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (textarea.value) {
      dialogList.insertAdjacentHTML(
        'beforeend',
        `
        <li class="dialog__item dialog__item--me dialog__item--new">
          <picture><source srcset="img/avatar.webp" type="image/webp"><img class="modal__avatar" src="img/avatar.jpg" alt="avatar"></picture>
          <p class="dialog__text">
            ${textarea.value}
          </p>
          <p class="dialog__date">${addZero(hours)}.${addZero(minutes)}</p>
        </li>
        `,
      );
      textarea.value = '';
      scroll();
      setTimeout(() => {
        document
          .querySelector('.dialog__item.dialog__item--new')
          .classList.remove('dialog__item--new');
      }, 2000);
    }
  });

  function scroll() {
    dialogList.scrollTop = dialogList.scrollHeight;
  }

  function addZero(num) {
    if (num < 10) {
      return `0${num}`;
    }
    return num;
  }
};
