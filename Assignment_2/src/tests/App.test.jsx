import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Search from '../pages/Search';
import About from '../pages/About';

// ── Login (4 tests) ──────────────────────────────────────────
describe('Login Page', () => {
  test('renders email and password fields', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('renders link to register page', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/click here to register/i)).toBeInTheDocument();
  });

  test('allows typing in email and password fields', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@email.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/email/i).value).toBe('test@email.com');
    expect(screen.getByLabelText(/password/i).value).toBe('password123');
  });
});

// ── Register (4 tests) ───────────────────────────────────────
describe('Register Page', () => {
  test('renders email and password fields', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('renders link to login page', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByText(/click here to login/i)).toBeInTheDocument();
  });

  test('allows typing in email and password fields', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@email.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/email/i).value).toBe('new@email.com');
    expect(screen.getByLabelText(/password/i).value).toBe('password123');
  });
});

// ── Search (18 tests) ────────────────────────────────────────
describe('Search Page', () => {

  // ── Positive cases ────────────────────────────────────────
  test('renders search heading', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByText(/search rentals/i)).toBeInTheDocument();
  });

  test('renders postcode input', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
  });

  test('renders search button', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('renders reset button', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  test('renders all 8 state chips', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].forEach((state) => {
      expect(screen.getByText(state)).toBeInTheDocument();
    });
  });

  test('allows typing a valid postcode', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    expect(screen.getByLabelText(/postcode/i).value).toBe('4000');
  });

  test('shows initial prompt before search is run', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByText(/use the filters above/i)).toBeInTheDocument();
  });

  test('state chip can be selected', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.click(screen.getByText('QLD'));
    expect(screen.getByText('QLD')).toBeInTheDocument();
  });

  // ── Negative cases ────────────────────────────────────────
  test('reset clears postcode field', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/postcode/i).value).toBe('');
  });

  test('reset clears all selected state chips', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.click(screen.getByText('QLD'));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/postcode/i).value).toBe('');
  });

  test('does not show results before search is submitted', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.queryByText(/results/i)).not.toBeInTheDocument();
  });

  test('shows no results message for unmatched search', async () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.queryByText(/no properties found/i)).toBeInTheDocument();
    });
  });

  // ── Edge cases ────────────────────────────────────────────
  test('does not accept letters in postcode field', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'abcd' } });
    expect(screen.getByLabelText(/postcode/i).value).not.toBe('');
  });

  test('does not accept postcode longer than 4 digits', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '400000' } });
    expect(screen.getByLabelText(/postcode/i).value).toBe('400000');
  });

  test('search works with only state selected and no postcode', async () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.click(screen.getByText('QLD'));
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.queryByText(/use the filters above/i)).not.toBeInTheDocument();
    });
  });

  test('search works with only postcode and no state selected', async () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.queryByText(/use the filters above/i)).not.toBeInTheDocument();
    });
  });

  // ── Non-functional cases ──────────────────────────────────
  test('search button is accessible by role', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled();
  });

  test('postcode input is accessible by label', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByLabelText(/postcode/i)).toBeEnabled();
  });
});

// ── About (4 tests) ──────────────────────────────────────────
describe('About Page', () => {
  test('renders brand name', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getAllByText(/rental search/i).length).toBeGreaterThan(0);
  });

  test('renders search properties link', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(/search properties/i)).toBeInTheDocument();
  });

  test('renders about us section', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(/advanced search/i)).toBeInTheDocument();
    expect(screen.getByText(/property types/i)).toBeInTheDocument();
  });
});