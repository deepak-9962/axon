# The Answer Architect

A hybrid mobile/web application that generates "Logical Answer Skeletons" (Mind Maps) for exam questions using Google Gemini 1.5 Flash.

## Features

-   **Secure "BYOK" Auth**: Bring Your Own Key. API keys are stored securely on the device.
-   **Responsive Layout**: IDE-like interface on Desktop, Native App feel on Mobile.
-   **AI Skeleton Generation**: Generates structured mind maps based on marks and command words.
-   **Missing Keyword Detector**: Highlights keywords in the mind map as you type in the practice box.

## Tech Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Mobile Runtime**: Capacitor 6+
-   **Visualization**: React Flow 12+
-   **Auto-Layout**: Dagre
-   **UI Components**: Shadcn UI
-   **State Management**: Zustand
-   **AI Client**: Google Generative AI SDK

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

4.  **Sync with Capacitor**:
    ```bash
    npx cap sync
    ```

## Mobile Development

To run on Android/iOS:

1.  Install Android Studio or Xcode.
2.  Add the platform:
    ```bash
    npx cap add android
    npx cap add ios
    ```
3.  Open the native project:
    ```bash
    npx cap open android
    # or
    npx cap open ios
    ```

## License

Private
