package resize

import "image"

// Resize image by selecting the nearest pixel. Output is a PNG.
func NearestNeighbor(img image.Image) *image.RGBA {
	w := img.Bounds().Max.X
	h := img.Bounds().Max.Y

	resized := image.NewRGBA(image.Rect(0, 0, 200, 200))

	for x := range 200 {
		for y := range 200 {
			srcX := x * (w / 200)
			srcY := y * (h / 200)
			c := img.At(srcX, srcY)
			resized.Set(x, y, c)
		}
	}

	return resized
}
