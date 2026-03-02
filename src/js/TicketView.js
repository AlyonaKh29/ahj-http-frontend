/**
 *  Класс для отображения тикетов на странице.
 *  Он содержит методы для генерации разметки тикета.
 * */
import Ticket from './Ticket';

export default class TicketView {
  constructor(ticket) {
    this.ticket = new Ticket(ticket);
  }

  ticketCreate() {
    const ticketElement = document.createElement('div');
    ticketElement.dataset.id = this.ticket.id;
    ticketElement.className = 'ticket';
    ticketElement.innerHTML = `
    <div class="ticket-name-description">
      <div class="status-name show-description">
        <input type="checkbox" class="status-btn ticket-name-status">
        <div status="ticket-name ticket-name-status">
          <span class="text-ticket-name">${this.ticket.name}</span>
        </div>
      </div>
      <div class="ticket-description"></div>
    </div>
    <div class="date-edit-delete">
      <p class="date-time">${new Date(this.ticket.created).toLocaleString()}</p>
      <div class="buttons">
        <button class="edit-btn ticket-btn">&#9998;</button>
        <button class="delete-btn ticket-btn">&#10006;</button>
      </div> 
    </div> 
    `;
    return ticketElement;
  }
}
