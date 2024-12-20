export async function GET() {

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjg5MTkxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRmYzg1YjUzN2FkYzE4RmYzNTRhMzJDNkUxM0JCRGNEZDk0YTZEMDEifQ",
      payload: "eyJkb21haW4iOiJzY3JhdGNobmlzbS52ZXJjZWwuYXBwIn0",
      signature: "MHg1MTM2ZThmNDgyZTQ5OTgwNDM3YmJhMzIzM2Q2Zjc1MDg5ZmNjYjZjZGNjOWZiYjY3ZTM3MzgzY2UxMjYyOWUwNzQ0ZTEyMDljOWE3NjNlM2E4OWMxYjNjNzE4NzM1Y2I1MDgzYzY3MWE0NTVlMzhmNDFlYTQ0ZTgzNmIyY2U4MDFi"
    },
    frame: {
      version: "1",
      name: "Pixel Cast",
      iconUrl: "https://scratchnism.vercel.app/pixel/splash.png",
      homeUrl: "https://scratchnism.vercel.app/pixel",
      imageUrl: "https://scratchnism.vercel.app/pixel/og-image.jpg",
      buttonTitle: "Cast your Pixel!",
      splashImageUrl: "https://scratchnism.vercel.app/pixel/splash.svg",
      splashBackgroundColor: "#ede4ca",
      webhookUrl: "https://scratchnism.vercel.app/api/pixel/webhook"
    },
  };

  return Response.json(config);
}