"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { ProfileCard } from "@/components/profile-card"
import { User } from "lucide-react"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("ProfileCard", () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it("renders correctly with provided props", () => {
    render(
      <ProfileCard
        icon={<User data-testid="icon" />}
        title="Test Title"
        description="Test Description"
        selected={false}
        onClick={mockOnClick}
      />,
    )

    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(screen.getByText("Test Title")).toBeInTheDocument()
    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })

  it("shows selected state when selected prop is true", () => {
    render(
      <ProfileCard
        icon={<User data-testid="icon" />}
        title="Test Title"
        description="Test Description"
        selected={true}
        onClick={mockOnClick}
      />,
    )

    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })

  it("calls onClick handler when clicked", () => {
    render(
      <ProfileCard
        icon={<User data-testid="icon" />}
        title="Test Title"
        description="Test Description"
        selected={false}
        onClick={mockOnClick}
      />,
    )

    fireEvent.click(screen.getByText("Test Title"))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
