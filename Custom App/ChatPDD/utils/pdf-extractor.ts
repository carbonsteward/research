import axios from "axios"
import * as pdfjs from "pdfjs-dist"

// Set the worker source
const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry")
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractPDFText(url: string): Promise<string> {
  try {
    // Fetch the PDF
    const response = await axios.get(url, { responseType: "arraybuffer" })
    const data = new Uint8Array(response.data)

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data })
    const pdf = await loadingTask.promise

    let fullText = ""

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    return fullText
  } catch (error) {
    console.error(`Error extracting PDF text from ${url}:`, error)
    return ""
  }
}
