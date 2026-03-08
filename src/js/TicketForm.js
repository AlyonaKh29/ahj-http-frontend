/**
 *  Класс для создания формы создания нового тикета
 * */

export default class TicketForm {
  constructor() {
    this.container = document.querySelector('.help-desk');
    this.ticketFormCreate();
  }

  ticketFormCreate() {
    this.form = document.createElement('div');
    this.form.className = 'formCreate';
    this.form.innerHTML = `
    <h4 class="form-title">Добавить тикет</h4>
    <form class="add-form" data-status="false">
      <p>Краткое описание</p>
      <textarea name="ticket-name" class="short-name description" required></textarea>
      <p>Подробное описание</p>
      <textarea name="ticket-text" class="detailed-name description" required></textarea>
      <div class="buttons-container">
        <button class="undo-btn form-btn" type="button">Отмена</button>
        <button type="submit" class="add-btn form-btn">Ok</button>
      </div>
    </form>
    `;
    this.form.style.display = 'none';
    this.container.append(this.form);
  }

  showForm(ticketData = null) {
    this.form.style.display = 'flex';
    if (ticketData) {
      this.form.querySelector('.short-name').value = ticketData.shortName || '';
      this.form.querySelector('.detailed-name').value = ticketData.detailedName || '';
      this.form.dataset.status = ticketData.status;
    }
    const stat = this.form.dataset.status === 'true';
    delete this.form.dataset.status;
    return stat;
  }

  removeForm() {
    this.form.style.display = 'none';
  }
}
