import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Without this a component from one test is still mounted during the next one,
// and queries start matching the wrong thing
afterEach(cleanup);
