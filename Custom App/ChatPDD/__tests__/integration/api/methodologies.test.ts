import { createMocks } from "node-mocks-http"
import methodologiesHandler from "@/app/api/methodologies/route"

describe("Methodologies API", () => {
  it("returns a list of methodologies", async () => {
    const { req, res } = createMocks({
      method: "GET",
    })

    await methodologiesHandler(req, res)

    expect(res._getStatusCode()).toBe(200)

    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.methodologies)).toBe(true)
    expect(data.methodologies.length).toBeGreaterThan(0)

    // Check structure of first methodology
    const firstMethodology = data.methodologies[0]
    expect(firstMethodology).toHaveProperty("id")
    expect(firstMethodology).toHaveProperty("name")
    expect(firstMethodology).toHaveProperty("standard")
  })

  it("filters methodologies by standard", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        standard: "verra",
      },
    })

    await methodologiesHandler(req, res)

    expect(res._getStatusCode()).toBe(200)

    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.methodologies)).toBe(true)

    // Check all returned methodologies are from Verra
    data.methodologies.forEach((methodology) => {
      expect(methodology.standard.toLowerCase()).toContain("verra")
    })
  })
})
