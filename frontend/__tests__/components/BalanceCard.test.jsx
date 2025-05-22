import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BalanceCard from "../../src/components/home/BalanceCard";

describe("BalanceCard Component", () => {
  const mockProps = {
    currentBalance: 1250.75,
    handleOpenIncomeModal: jest.fn(),
    handleOpenExpenseModal: jest.fn(),
  };

  it("renders current balance correctly", () => {
    render(<BalanceCard {...mockProps} />);

    // Check if the balance is displayed
    expect(screen.getByText("Current Balance")).toBeInTheDocument();
    expect(screen.getByText("$1250.75")).toBeInTheDocument();
  });

  it("calls income modal handler when income button is clicked", () => {
    render(<BalanceCard {...mockProps} />);

    // Click the Add Income button
    fireEvent.click(screen.getByText("Add Income"));

    // Check if the handler was called
    expect(mockProps.handleOpenIncomeModal).toHaveBeenCalledTimes(1);
  });

  it("calls expense modal handler when expense button is clicked", () => {
    render(<BalanceCard {...mockProps} />);

    // Click the Add Expense button
    fireEvent.click(screen.getByText("Add Expense"));

    // Check if the handler was called
    expect(mockProps.handleOpenExpenseModal).toHaveBeenCalledTimes(1);
  });
});
