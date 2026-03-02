/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 * */
export default class TicketService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async list(method) {
    try {
      const response = await fetch(`${this.baseUrl}?method=${method}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tickets = await response.json();
      return tickets || [];
    } catch (error) {
      console.error('TicketService.list error:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await fetch(`${this.baseUrl}?method=ticketById&id=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TicketService.get error:', error);
      throw error;
    }
  }

  async create(method, data) {
    try {
      const response = await fetch(`${this.baseUrl}?method=${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TicketService.list error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await fetch(`${this.baseUrl}?method=updateById&id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TicketService.update error:', error);
      throw error;
    }
  }

  async delete(id, method = 'deleteById') {
    try {
      const response = await fetch(`${this.baseUrl}?method=${method}&id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('TicketService.delete error:', error);
      throw error;
    }
  }
}
