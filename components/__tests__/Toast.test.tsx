import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App, { useToast } from '../../App';

const TestComponent = () => {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast('Test message', 'success')}>
        Add Toast
      </button>
    </div>
  );
};

describe('Toast Notification System', () => {
  it('should add and display a toast message', () => {
    render(
      <App>
        <TestComponent />
      </App>
    );

    const addButton = screen.getByText('Add Toast');
    fireEvent.click(addButton);

    const toastMessage = screen.getByText('Test message');
    expect(toastMessage).toBeInTheDocument();
  });
});
