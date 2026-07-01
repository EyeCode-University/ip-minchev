// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Server Action не должен реально импортироваться в jsdom (тянет next/headers).
const submitApplicationMock = vi.hoisted(() => vi.fn(async () => ({ success: false, error: null })));
vi.mock('@/app/actions', () => ({ submitApplication: submitApplicationMock }));

// next/image и next/link — лёгкие заглушки.
vi.mock('next/image', () => ({
  default: (props) => <img {...props} alt={props.alt ?? ''} />,
}));
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

import RequestForm from '@/components/RequestForm/RequestForm';

beforeEach(() => {
  submitApplicationMock.mockClear();
});

describe('RequestForm (smoke)', () => {
  it('рендерит все обязательные поля', () => {
    render(<RequestForm />);
    expect(screen.getByLabelText(/Имя \/ Компания/)).toBeRequired();
    expect(screen.getByLabelText(/Телефон или Email/)).toBeRequired();
    expect(screen.getByLabelText(/Описание запроса/)).toBeRequired();
    expect(screen.getByText(/Отправить заявку/)).toBeInTheDocument();
  });

  it('кнопка отправки заблокирована, пока нет согласия', () => {
    render(<RequestForm />);
    const submit = screen.getByRole('button', { name: /Отправить заявку/ });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(submit).toBeEnabled();
  });

  it('показывает имя выбранного файла', () => {
    render(<RequestForm />);
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['x'], 'chertezh.dwg', { type: 'application/octet-stream' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('chertezh.dwg')).toBeInTheDocument();
  });

  it('содержит ссылки на политику и согласие', () => {
    render(<RequestForm />);
    expect(screen.getByRole('link', { name: /Политикой конфиденциальности/ })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /Согласием на обработку ПДн/ })).toHaveAttribute('href', '/consent');
  });
});
