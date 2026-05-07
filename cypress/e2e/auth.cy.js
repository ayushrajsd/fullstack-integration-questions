describe('Auth Flow - Register and Login', () => {
  it('TC1 - Register page renders name, email, password fields and button', () => {
    cy.visit('/register');
    cy.get('[data-testid="name-input"]').should('exist');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="register-btn"]').should('exist');
  });

  it('TC2 - Successful registration stores token in localStorage and redirects to /browse', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        token: 'mock.jwt.token',
        user: { _id: '123', name: 'Alice', email: 'alice@test.com' },
      },
    }).as('register');

    cy.visit('/register');
    cy.get('[data-testid="name-input"]').type('Alice');
    cy.get('[data-testid="email-input"]').type('alice@test.com');
    cy.get('[data-testid="password-input"]').type('secret123');
    cy.get('[data-testid="register-btn"]').click();
    cy.wait('@register');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('cinescope_token')).to.eq('mock.jwt.token');
    });
    cy.url().should('include', '/browse');
  });

  it('TC3 - Duplicate email registration shows error message', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 400,
      body: { success: false, message: 'Email already registered' },
    }).as('registerFail');

    cy.visit('/register');
    cy.get('[data-testid="name-input"]').type('Alice');
    cy.get('[data-testid="email-input"]').type('alice@test.com');
    cy.get('[data-testid="password-input"]').type('secret123');
    cy.get('[data-testid="register-btn"]').click();
    cy.wait('@registerFail');

    cy.get('[data-testid="error-msg"]').should('contain', 'Email already registered');
  });

  it('TC4 - Wrong password on login shows error message', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { success: false, message: 'Invalid credentials' },
    }).as('loginFail');

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('bob@test.com');
    cy.get('[data-testid="password-input"]').type('wrongpass');
    cy.get('[data-testid="login-btn"]').click();
    cy.wait('@loginFail');

    cy.get('[data-testid="error-msg"]').should('contain', 'Invalid credentials');
  });
});
