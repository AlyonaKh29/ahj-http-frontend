import HelpDesk from './HelpDesk';
import TicketService from './TicketService';

const root = document.querySelector('.help-desk');
const url = 'https://ahj-http-backend-8d5i.onrender.com';

const ticketService = new TicketService(url);
const app = new HelpDesk(root, ticketService);

app.init();
