import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login     from '../pages/Login';
import Register  from '../pages/Register';
import Home      from '../pages/Home';
import Search    from '../pages/Search';
import About     from '../pages/About';
import MyRatings from '../pages/MyRatings';


// ── Shared helpers ───────────────────────────────────────────
const renderIn = (Component) => render(<MemoryRouter><Component /></MemoryRouter>);

const mockProperty = (overrides = {}) => ({
  id: 'prop-1',
  title: '2BR Apartment Brisbane',
  rent: 450,
  propertyType: 'Apartment',
  suburb: 'Brisbane City',
  state: 'QLD',
  postcode: '4000',
  bedrooms: 2,
  bathrooms: 1,
  parkingSpaces: 1,
  averageRating: 4.2,
  ...overrides,
});

// ── Login (5 tests) ──────────────────────────────────────────
describe('Login Page', () => {
  test('renders email field', () => {
    renderIn(Login);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('renders password field', () => {
    renderIn(Login);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    renderIn(Login);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('accepts typed email and password', () => {
    renderIn(Login);
    fireEvent.change(screen.getByLabelText(/email/i),    { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    expect(screen.getByLabelText(/email/i).value).toBe('user@test.com');
    expect(screen.getByLabelText(/password/i).value).toBe('secret123');
  });

  test('has a link to the register page', () => {
    renderIn(Login);
    expect(screen.getByText(/click here to register/i)).toBeInTheDocument();
  });
});

// ── Register (5 tests) ───────────────────────────────────────
describe('Register Page', () => {
  test('renders email field', () => {
    renderIn(Register);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('renders password field', () => {
    renderIn(Register);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    renderIn(Register);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('accepts typed email and password', () => {
    renderIn(Register);
    fireEvent.change(screen.getByLabelText(/email/i),    { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } });
    expect(screen.getByLabelText(/email/i).value).toBe('new@test.com');
    expect(screen.getByLabelText(/password/i).value).toBe('pass123');
  });

  test('has a link back to the login page', () => {
    renderIn(Register);
    expect(screen.getByText(/click here to login/i)).toBeInTheDocument();
  });
});

// ── Home (2 tests) ───────────────────────────────────────────
describe('Home Page', () => {
  test('renders the hero heading', () => {
    renderIn(Home);
    expect(screen.getByText(/find your next rental/i)).toBeInTheDocument();
  });

  test('renders the View Properties and Filters buttons', () => {
    renderIn(Home);
    expect(screen.getByText(/view properties/i)).toBeInTheDocument();
  });
});

// ── Search (14 tests) ────────────────────────────────────────
describe('Search Page', () => {
  test('renders the page heading', () => {
    renderIn(Search);
    expect(screen.getByText(/search rentals/i)).toBeInTheDocument();
  });

  test('renders the postcode input', () => {
    renderIn(Search);
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
  });

  test('renders search and reset buttons', () => {
    renderIn(Search);
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /reset/i })).toBeEnabled();
  });

  test('renders all 8 Australian state chips', () => {
    renderIn(Search);
    ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].forEach((s) =>
      expect(screen.getByText(s)).toBeInTheDocument()
    );
  });

  test('shows initial prompt before any search is run', () => {
    renderIn(Search);
    expect(screen.getByText(/use the filters above/i)).toBeInTheDocument();
  });

  test('accepts a valid 4-digit postcode', () => {
    renderIn(Search);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    expect(screen.getByLabelText(/postcode/i).value).toBe('4000');
  });

  test('state chip can be clicked', () => {
    renderIn(Search);
    fireEvent.click(screen.getByText('QLD'));
    expect(screen.getByText('QLD')).toBeInTheDocument();
  });

  test('multiple state chips can be selected together', () => {
    renderIn(Search);
    fireEvent.click(screen.getByText('QLD'));
    fireEvent.click(screen.getByText('NSW'));
    expect(screen.getByText('QLD')).toBeInTheDocument();
    expect(screen.getByText('NSW')).toBeInTheDocument();
  });

  test('reset clears the postcode field', () => {
    renderIn(Search);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/postcode/i).value).toBe('');
  });

  test('reset restores the initial prompt', () => {
    renderIn(Search);
    fireEvent.click(screen.getByText('QLD'));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText(/use the filters above/i)).toBeInTheDocument();
  });

  test('hides the initial prompt after search is submitted', async () => {
    renderIn(Search);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() =>
      expect(screen.queryByText(/use the filters above/i)).not.toBeInTheDocument()
    );
  });

  test('shows "no properties found" for an unmatched postcode', async () => {
    renderIn(Search);
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() =>
      expect(screen.getByText(/no properties found/i)).toBeInTheDocument()
    );
  });

  test('search works with only a state selected', async () => {
    renderIn(Search);
    fireEvent.click(screen.getByText('QLD'));
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() =>
      expect(screen.queryByText(/use the filters above/i)).not.toBeInTheDocument()
    );
  });

  test('postcode field updates value on change', () => {
    renderIn(Search);
    const input = screen.getByLabelText(/postcode/i);
    fireEvent.change(input, { target: { value: '2000' } });
    expect(input.value).toBe('2000');
  });
});

// ── About (3 tests) ──────────────────────────────────────────
describe('About Page', () => {
  test('renders the brand name', () => {
    renderIn(About);
    expect(screen.getAllByText(/rental search/i).length).toBeGreaterThan(0);
  });

  test('renders the about us section', () => {
    renderIn(About);
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    renderIn(About);
    expect(screen.getByText(/advanced search/i)).toBeInTheDocument();
    expect(screen.getByText(/property types/i)).toBeInTheDocument();
  });
});

// ── Ratings helper (5 tests) ─────────────────────────────────
describe('Ratings Helper — saveRating / getSavedRatings', () => {
  beforeEach(() => localStorage.clear());

  test('returns empty array when no ratings are saved', () => {
    expect(getSavedRatings()).toEqual([]);
  });

  test('persists a rating and retrieves it', () => {
    saveRating(mockProperty(), 4);
    const [saved] = getSavedRatings();
    expect(saved.id).toBe('prop-1');
    expect(saved.rating).toBe(4);
  });

  test('saves all property fields correctly', () => {
    saveRating(mockProperty(), 5);
    const [saved] = getSavedRatings();
    expect(saved.title).toBe('2BR Apartment Brisbane');
    expect(saved.rent).toBe(450);
    expect(saved.suburb).toBe('Brisbane City');
    expect(saved.state).toBe('QLD');
    expect(saved.postcode).toBe('4000');
  });

  test('overwrites an existing rating for the same property', () => {
    saveRating(mockProperty(), 2);
    saveRating(mockProperty(), 5);
    const ratings = getSavedRatings();
    expect(ratings).toHaveLength(1);
    expect(ratings[0].rating).toBe(5);
  });

  test('stores multiple ratings for different properties', () => {
    saveRating(mockProperty({ id: 'prop-1' }), 5);
    saveRating(mockProperty({ id: 'prop-2' }), 3);
    expect(getSavedRatings()).toHaveLength(2);
  });
});

// ── MyRatings Page (6 tests) ─────────────────────────────────
describe('MyRatings Page', () => {
  beforeEach(() => localStorage.clear());

  test('renders the page heading', () => {
    renderIn(MyRatings);
    expect(screen.getByText(/my ratings/i)).toBeInTheDocument();
  });

  test('shows empty-state alert when no ratings exist', () => {
    renderIn(MyRatings);
    expect(screen.getByText(/you haven't rated any properties yet/i)).toBeInTheDocument();
  });

  test('renders a property card after a rating is saved', () => {
    saveRating(mockProperty(), 4);
    renderIn(MyRatings);
    expect(screen.getByText('2BR Apartment Brisbane')).toBeInTheDocument();
  });

  test('displays the weekly rent on the card', () => {
    saveRating(mockProperty(), 4);
    renderIn(MyRatings);
    expect(screen.getByText(/\$450\/week/i)).toBeInTheDocument();
  });

  test('displays the user rating out of 5', () => {
    saveRating(mockProperty(), 4);
    renderIn(MyRatings);
    expect(screen.getByText(/your rating: 4 \/ 5/i)).toBeInTheDocument();
  });

  test('displays "No rating" when averageRating is null', () => {
    saveRating(mockProperty({ averageRating: null }), 3);
    renderIn(MyRatings);
    expect(screen.getByText(/no rating/i)).toBeInTheDocument();
  });
});
