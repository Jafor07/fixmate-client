import { api } from "@/lib/api"

export async function uploadServiceImage(file?: File): Promise<string> {
  if (!file) throw new Error("Choose a service image.")
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose an image under 5 MB.")
  }
  const image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("The selected image could not be read."))
    reader.readAsDataURL(file)
  })
  const result = await api<{ url: string }>("/api/upload", {
    method: "POST",
    body: JSON.stringify({ image }),
  })
  return result.url
}
