export async function GET() {

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjg5MTkxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRmYzg1YjUzN2FkYzE4RmYzNTRhMzJDNkUxM0JCRGNEZDk0YTZEMDEifQ",
      payload: "eyJkb21haW4iOiJzY3JhdGNobmlzbWUudmVyY2VsLmFwcCJ9",
      signature: "MHg5MmQ4NGMwMTBiMjE0NmRkZGJlZTUyZWQ4MDE2ZjlmOTQ5ODE3YzU4NWEzMmY3MWE5MTQyMGYwMTMzMDg4YTY1MTI4NTA0Yjg3MTkyM2MzM2E3YzY0ODJmZmVlNmJmOGI5ZmM1NWU5YzRkMTRmNjM5MGZkMTA1NWQ0NWNhYTI3MDFj"
    },
    frame: {
      name: "Scratch",
      version: "0.0.1",
      iconUrl: "https://scratchnism.vercel.app/scratch.png",
      homeUrl: "https://scratchnism.vercel.app",
      splashImageUrl: "https://scratchnism.vercel.app/splash.svg",
      splashBackgroundColor: "#ede4ca"
    },
  };

  return Response.json(config);
}