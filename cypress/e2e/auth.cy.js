describe('Auth Flow - Register, Login, and Logout', () => {
  it('TC1 - Register page renders name, email, password fields and button', () => {
    cy.visit('/register');
    cy.get('[data-testid="name-input"]').should('exist');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="register-btn"]').should('exist');
  });

  it('TC2 - Successful registration stores token and nudges learner to login', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        token: 'mock.register.jwt',
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
      expect(win.localStorage.getItem('cinescope_token')).to.eq('mock.register.jwt');
    });
    cy.get('[data-testid="register-success"]').should('contain', 'Account created for alice@test.com');
    cy.get('[data-testid="login-nudge-link"]').should('contain', 'logging in with your new credentials');
    cy.url().should('include', '/register');
  });

  it('TC3 - Login nudge link opens login page and prefills registered email', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        token: 'mock.register.jwt',
        user: { _id: '123', name: 'Alice', email: 'alice@test.com' },
      },
    }).as('register');

    cy.visit('/register');
    cy.get('[data-testid="name-input"]').type('Alice');
    cy.get('[data-testid="email-input"]').type('alice@test.com');
    cy.get('[data-testid="password-input"]').type('secret123');
    cy.get('[data-testid="register-btn"]').click();
    cy.wait('@register');
    cy.get('[data-testid="login-nudge-link"]').click();

    cy.url().should('include', '/login');
    cy.get('[data-testid="login-nudge-message"]').should('contain', 'Now log in');
    cy.get('[data-testid="email-input"]').should('have.value', 'alice@test.com');
  });

  it('TC4 - Successful login stores token and redirects to /browse', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'mock.login.jwt',
        user: { _id: '456', name: 'Bob', email: 'bob@test.com' },
      },
    }).as('login');

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('bob@test.com');
    cy.get('[data-testid="password-input"]').type('mypassword');
    cy.get('[data-testid="login-btn"]').click();
    cy.wait('@login');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('cinescope_token')).to.eq('mock.login.jwt');
    });
    cy.url().should('include', '/browse');
  });

  it('TC5 - Logout removes token and redirects to /login', () => {
    cy.visit('/browse', {
      onBeforeLoad(win) {
        win.localStorage.setItem('cinescope_token', 'mock.login.jwt');
      },
    });

    cy.get('[data-testid="logout-btn"]').click();

    cy.window().then((win) => {
      expect(win.localStorage.getItem('cinescope_token')).to.eq(null);
    });
    cy.url().should('include', '/login');
  });

  it('TC6 - Duplicate email registration shows error message', () => {
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

  it('TC7 - Wrong password on login shows error message', () => {
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
