describe('Fastify Server', () => {
  it('should return status on root route', () => {
    cy.request('http://localhost:3000/').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'Server running');
    });
  });

  it('should register a new user', () => {
    const uniqueEmail = `cypress_${Date.now()}@example.com`;
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress User',
        email: uniqueEmail,
        password: 'cypresspass'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body.email).to.eq(uniqueEmail);
    });
  });

  it('should login with correct credentials', () => {
    const email = 'cypress@example.com';
    const password = 'cypresspass';

    // Register the user first
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress User',
        email,
        password
      },
      failOnStatusCode: false // ignore if already exists
    }).then(() => {
      // Now try to login
      cy.request('POST', 'http://localhost:3000/login', {
        email,
        password
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Login successful');
      });
    });
  });

  it('should fail login with wrong credentials', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/login',
      failOnStatusCode: false,
      body: {
        email: 'cypress@example.com',
        password: 'wrongpass'
      }
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Invalid credentials');
    });
  });

  it('should not get users list without JWT', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/users',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Unauthorized');
    });
  });

  it('should get users list', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress User',
        email: 'cypress@example.com',
        password: 'cypresspass'
      },
      failOnStatusCode: false
    }).then(() => {
      cy.request('POST', 'http://localhost:3000/login', {
        email: 'cypress@example.com',
        password: 'cypresspass'
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
        cy.request({
          method: 'GET',
          url: 'http://localhost:3000/users',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(Array.isArray(response.body)).to.be.true;
          expect(response.body.some(u => u.email === 'cypress@example.com')).to.be.true;
        });
      });
    });
  });

  it('should not get tickets without JWT', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/tickets',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Unauthorized');
    });
  });

  it('should get tickets with valid JWT', () => {
    // Register and login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress User',
        email: 'cypress@example.com',
        password: 'cypresspass'
      },
      failOnStatusCode: false
    }).then(() => {
      cy.request('POST', 'http://localhost:3000/login', {
        email: 'cypress@example.com',
        password: 'cypresspass'
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
        cy.request({
          method: 'GET',
          url: 'http://localhost:3000/tickets',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(Array.isArray(response.body)).to.be.true;
          expect(response.body.length).to.be.greaterThan(0);
          expect(response.body[0]).to.have.all.keys('id', 'title', 'description', 'status', 'userId');
        });
      });
    });
  });

  it('should not create a ticket without JWT', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/tickets',
      failOnStatusCode: false,
      body: {
        title: 'Cypress Ticket',
        description: 'Created by Cypress',
        status: 'open'
      }
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Unauthorized');
    });
  });

  it('should create a ticket with valid JWT', () => {
    // Register and login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress Ticket User',
        email: 'ticketuser@example.com',
        password: 'ticketpass'
      },
      failOnStatusCode: false
    }).then(() => {
      cy.request('POST', 'http://localhost:3000/login', {
        email: 'ticketuser@example.com',
        password: 'ticketpass'
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/tickets',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            title: 'Cypress Ticket',
            description: 'Created by Cypress',
            status: 'open'
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('id');
          expect(response.body.title).to.eq('Cypress Ticket');
          expect(response.body.description).to.eq('Created by Cypress');
          expect(response.body.status).to.eq('open');
        });
      });
    });
  });

  it('should get a ticket by id with valid JWT', () => {
    // Register and login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: {
        name: 'Cypress Ticket User2',
        email: 'ticketuser2@example.com',
        password: 'ticketpass2'
      },
      failOnStatusCode: false
    }).then(() => {
      cy.request('POST', 'http://localhost:3000/login', {
        email: 'ticketuser2@example.com',
        password: 'ticketpass2'
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body.token;
        // Create a ticket
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/tickets',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            title: 'Cypress Ticket 2',
            description: 'Created by Cypress 2',
            status: 'open'
          }
        }).then((createRes) => {
          expect(createRes.status).to.eq(201);
          const ticketId = createRes.body.id;
          // Get the ticket by id
          cy.request({
            method: 'GET',
            url: `http://localhost:3000/tickets/${ticketId}`,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body).to.have.property('id', ticketId);
            expect(getRes.body.title).to.eq('Cypress Ticket 2');
          });
        });
      });
    });
  });
});