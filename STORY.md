# LUXBIN Photonic World Builder

> *Build worlds with words, render them in light.*

## Inspiration

The idea came from a simple question: **what if we could see data as light?**

LUXBIN is a photonic computing ecosystem I've been building — it encodes binary data into visible light wavelengths using a 77-character alphabet mapped across the $400\text{–}700\,\text{nm}$ visible spectrum. Every character has a unique spectral signature. Every byte becomes color.

When I saw the Gemini 3 hackathon, the connection was immediate. Gemini generates structured worlds from natural language. LUXBIN encodes those worlds into light. Together, they create something neither could alone: **AI-generated universes you can see as living photonic spectra.**

I was also inspired by the idea that future quantum computers — especially those using diamond nitrogen-vacancy (NV) centers at $637\,\text{nm}$ — could natively read and store these light-encoded worlds. A world built today could be loaded into a quantum computer tomorrow.

## What It Does

Users describe a world in plain English. Gemini 3 Flash generates a complete environment as structured JSON — terrain, creatures, celestial bodies, vegetation, structures, and atmospheric effects. Each object is assigned a wavelength $\lambda$ in the visible spectrum:

$$\lambda \in [400, 700]\,\text{nm}$$

The app then:

1. **Renders** the world on a Canvas with animated photonic objects — glowing, pulsing, orbiting — each colored by its true spectral wavelength
2. **Encodes** the world name into LUXBIN light language, displayed as a living light bar in the header
3. **Lets you explore** — ask Gemini questions like *"What's behind that mountain?"* and it expands the world in real-time, adding new objects to the canvas
4. **Displays the photonic spectrum** — a wavelength-sorted visualization of every object's spectral signature

Each object's color is computed from its wavelength using the CIE approximation for spectral-to-RGB conversion, not arbitrary hex values. A $520\,\text{nm}$ object is genuinely green. A $450\,\text{nm}$ object is genuinely blue.

## How I Built It

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Canvas API, Google Gemini 3 Flash API (`@google/genai` SDK)

**Architecture:**

```
User Input → /api/generate (Gemini 3) → Structured World JSON → Canvas Renderer
                                                                ↕
User Chat  → /api/chat (Gemini 3)    → World Expansion        → Live Update
                                                                ↕
World Data → LUXBIN Encoder          → Photonic Spectrum       → Light Show
```

The Gemini integration uses carefully structured prompts that constrain output to valid JSON with specific schemas. Each API route handles one concern:

- **`/api/generate`** — takes a natural language prompt, returns a complete world with $8\text{–}15$ objects
- **`/api/chat`** — takes a question + current world state, returns a narrative response and an array of new objects

The LUXBIN encoder maps each character $c_i$ in the 77-character alphabet to a wavelength:

$$\lambda(c_i) = 400 + \frac{i}{76} \times 300 \quad \text{nm}$$

Then converts wavelength to HSL color space:

$$h = 270 - \frac{\lambda - 400}{300} \times 270°$$

The Canvas renderer sorts objects by depth ($z$-coordinate) and applies per-object animations (pulse, orbit, drift, shimmer, grow) with radial gradient glows computed from the spectral RGB values.

## Challenges

**Structured output from Gemini.** Getting Gemini to consistently return valid JSON with the exact schema needed — correct field names, value ranges, proper types — required iterative prompt engineering. The model sometimes wraps output in markdown fences or adds commentary. I built a cleaning layer that strips code fences and handles edge cases.

**Spectral accuracy.** Converting wavelengths to screen colors is non-trivial. The visible spectrum doesn't map linearly to RGB. I implemented a piecewise approximation of the CIE color matching functions to ensure that a $580\,\text{nm}$ object actually looks yellow, not some arbitrary color.

**Real-time world expansion.** When the chat explorer adds new objects, they need to appear on the canvas without resetting the animation state. React's state model made this tricky — I had to ensure the Canvas `useEffect` responds to world changes while preserving the animation timer.

**Tailwind v4 migration.** Tailwind CSS v4 moved to a CSS-first configuration model and requires `@tailwindcss/postcss` instead of the direct PostCSS plugin. This caused build failures that took debugging to resolve.

## What I Learned

- **Gemini 3 Flash** is fast enough for interactive world-building — responses come back in $1\text{–}3$ seconds, which feels responsive for a creative tool
- **Constraining LLM output to strict schemas** is an art — the prompt structure matters more than the instructions themselves
- **Photonic encoding** is more than a metaphor — mapping data to physical wavelengths creates genuinely beautiful visualizations that also carry real information
- The gap between "AI generates text" and "AI generates interactive experiences" is smaller than I expected — the key is structured output + a good renderer

## Built With

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS v4
- Google Gemini 3 Flash API
- Canvas API
- LUXBIN Light Language Protocol
- Vercel (deployment)
