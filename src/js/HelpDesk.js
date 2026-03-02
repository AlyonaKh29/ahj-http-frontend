/**
 *  Основной класс приложения
 * */
import TicketView from './TicketView';
import TicketForm from './TicketForm';

export default class HelpDesk {
  constructor(container, ticketService) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }
    this.container = container;
    this.ticketService = ticketService;
    this.addButton = this.container.querySelector('.add-button-ticket');
    this.ticketsContainer = this.container.querySelector('.tickets-container');
    this.addButton.addEventListener('click', this.addTicket.bind(this));
    this.loadAndDisplayTickets = this.loadAndDisplayTickets.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  init() {
    this.loadAndDisplayTickets();
  }

  async loadAndDisplayTickets() {
    try {
      // Загружаем список тикетов с сервера
      const tickets = await this.ticketService.list('allTickets');
      if (tickets.length === 0) {
        this.container.innerHTML = '<p>Нет тикетов для отображения</p>';
        return;
      }
      this.ticketsContainer.innerHTML = '';
      tickets.forEach((ticket) => {
        this.ticketCreateView(ticket);
      });
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      alert('Произошла ошибка при загрузке тикетов');
    }
  }

  ticketCreateView(ticket) {
    // Создание элемента ticket, добавление его в контейнер
    const ticketElement = new TicketView(ticket);
    const ticketEl = ticketElement.ticketCreate();
    ticketEl.dataset.id = ticket.id;
    this.ticketsContainer.append(ticketEl);
    // Устанавливаем слушатели на кнопки и чекбокс тикета
    const deleteBtn = ticketEl.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => this.handleDeleteClick(e, ticket.id));

    const editBtn = ticketEl.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => this.handleEditClick(e));

    const statusCheckbox = ticketEl.querySelector('.status-btn');
    statusCheckbox.checked = ticket.status;
    statusCheckbox.addEventListener('change', (e) => {
      this.handleStatusChange(ticket.id, e.target.checked);
    });
    // Клик по тикету для показа подробной информации
    ticketEl.addEventListener('click', async (e) => {
      if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn') || e.target.closest('.status-btn')) {
        return;
      }
      // Блок описания внутри тикета
      const descriptionEl = ticketEl.querySelector('.ticket-description');
      if (descriptionEl.style.display === 'block') {
        descriptionEl.style.display = 'none';
      } else {
        await this.showDescription(ticket.id, descriptionEl);
        descriptionEl.style.display = 'block';
      }
    });
  }

  async showDescription(id, descriptionEl) {
    // Запрос на показподробного описания
    try {
      const ticketData = await this.ticketService.get(id);
      descriptionEl.textContent = ticketData.description || 'Нет описания';
    } catch (error) {
      console.error('Ошибка загрузки данных тикета:', error);
    }
  }

  handleEditClick(e) {
    // Слушатель для кнопок редактирования
    const ticketElement = e.target.closest('.ticket');
    const ticketId = ticketElement.dataset.id;

    if (!ticketId) {
      console.error('Ticket ID not found');
      return;
    }
    this.editTicket(ticketId).catch((error) => {
      console.error('Edit ticket error:', error);
    });
  }

  async editTicket(id) {
    // Запрос на редактирование тикета
    try {
      const ticket = await this.ticketService.get(id);
      if (!this.container.querySelector('form')) {
        this.ticketForm = new TicketForm();
      }
      const data = {
        id: ticket.id,
        shortName: ticket.name,
        detailedName: ticket.description,
        status: ticket.status,
      };

      const stat = this.ticketForm.showForm(data);
      this.bindToDomButtons();
      this.listenToTheFormsButtons(id, stat); // Передаем id для обновления и статус, чтобы не потерять его
    } catch (error) {
      console.error('Ошибка при редактировании тикета:', error);
      alert('Произошла ошибка при загрузке данных тикета');
    }
  }

  bindToDomButtons() {
    // Кнопки формы
    this.form = this.container.querySelector('form');
    this.addButton = this.form.querySelector('.add-btn');
    this.undoButton = this.form.querySelector('.undo-btn');
  }

  listenToTheFormsButtons(id = null, stat) {
    // Слушатели кнопок формы
    this._removeForm = this.removeForm.bind(this);
    this.undoButton.addEventListener('click', this._removeForm);
    this._submitForm = (event) => this.submitForm(event, id, stat);
    this.addButton.addEventListener('click', this._submitForm);
  }

  removeForm() {
    // Удаление слушателей кнопок формы
    this.undoButton.removeEventListener('click', this._removeForm);
    this.addButton.removeEventListener('click', this._submitForm);
    this.ticketForm.removeForm();
  }

  async submitForm(event, id = null, stat) {
    // Отправка формы
    event.preventDefault();
    const shortName = this.form.querySelector('.short-name').value.trim();
    const detailedName = this.form.querySelector('.detailed-name').value.trim();
    const status = stat;
    const data = {
      name: shortName,
      description: detailedName,
      status,
    };
    try {
      if (id) {
        // Обновление существующего тикета
        const res = await this.ticketService.update(id, data);
        this.showUpdateTicket(res);
      } else {
        // Создание нового тикета
        await this.saveNewTicket({
          ...data,
          id: null,
          created: Date.now(),
        });
      }
      this.form.reset();
      this.removeForm();
    } catch (error) {
      console.error('Ошибка при сохранении тикета:', error);
      alert('Произошла ошибка при сохранении тикета');
    }
  }

  showUpdateTicket(data) {
    const ticketElement = this.container.querySelector(`[data-id="${data.id}"]`);
    if (ticketElement) {
      const nameEl = ticketElement.querySelector('.text-ticket-name');
      const descriptionEl = ticketElement.querySelector('.ticket-description');
      nameEl.textContent = data.name;
      descriptionEl.textContent = data.description;
    }
  }

  handleDeleteClick(e, ticketId) {
    // Кнопка удаления тикета
    e.stopPropagation();
    const ticketEl = e.target.closest('.ticket');
    this.showDeleteModal(ticketId, ticketEl);
  }

  createModalOverlay() {
    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <p class="modal-text">Вы уверены, что хотите удалить тикет? Это действие необратимо.</p>
          <div class="modal-buttons">
            <button class="modal-btn cancel-btn">Отмена</button>
            <button class="modal-btn ok-btn">Ок</button>
          </div>
        </div>
      </div>
    `;
  }

  showDeleteModal(ticketId, ticketEl) {
    // Предупреждение перед удалением тикета с сервера
    const modalHTML = this.createModalOverlay();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.body.lastElementChild;
    const okBtn = modalElement.querySelector('.ok-btn');
    const cancelBtn = modalElement.querySelector('.cancel-btn');
    const closeModal = () => {
      modalElement.remove();
    };
    cancelBtn.addEventListener('click', closeModal);

    okBtn.addEventListener('click', async () => {
      try {
        await this.ticketService.delete(ticketId);
        if (ticketEl) {
          ticketEl.remove();
        }
        if (this.ticketsContainer.children.length === 0) {
          this.container.innerHTML = '<p>Нет тикетов для отображения</p>';
        }
      } catch (error) {
        console.error('Ошибка при удалении тикета:', error);
        alert('Произошла ошибка при удалении тикета');
      } finally {
        closeModal();
      }
    });
  }

  addTicket(e) {
    // Функция после клика по кнопке добавления нового тикета
    if (e.target.classList.contains('add-button-ticket')) {
      if (!this.container.querySelector('form')) {
        this.ticketForm = new TicketForm();
      }
      this.ticketForm.showForm();
      this.bindToDomButtons();
      this.listenToTheFormsButtons();
    }
  }

  async saveNewTicket(data) {
    // Запрос на создание нового тикета и добавление его в контейнер
    try {
      const res = await this.ticketService.create('createTicket', data);
      this.ticketCreateView(res);
    } catch (error) {
      console.error('Ошибка при создании тикета:', error);
      alert('Произошла ошибка при создании тикета. Пожалуйста, попробуйте еще раз.');
    }
  }

  async handleStatusChange(id, newStatus) {
    // Запрос на изменение статуса по состоянию чекбокса
    try {
      await this.ticketService.update(id, { status: newStatus });
    } catch (error) {
      console.error('Ошибка при смене статуса:', error);
      alert('Не удалось обновить статус');
    }
  }
}
