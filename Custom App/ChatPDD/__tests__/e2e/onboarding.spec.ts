import { test, expect } from "@playwright/test"

test.describe("Onboarding Flow", () => {
  test("completes the onboarding process", async ({ page }) => {
    // Navigate to the onboarding page
    await page.goto("/onboarding")

    // Verify page title
    await expect(page.locator("h1")).toContainText("Welcome to the Carbon Mitigation Assistant")

    // Select a profile
    await page.getByText("Project Developer").click()

    // Continue to next step
    await page.getByRole("button", { name: "Continue" }).click()

    // Verify we're on the experience level step
    await expect(page.getByText("Your Experience Level")).toBeVisible()

    // Select experience level
    await page.getByText("Intermediate").click()

    // Continue to project setup
    await page.getByRole("button", { name: "Continue to Project Setup" }).click()

    // Verify we're redirected to the project creation page
    await expect(page).toHaveURL("/project/new")
    await expect(page.locator("h1")).toContainText("Create New Project")
  })
})
