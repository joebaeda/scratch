import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ipfsHash = searchParams.get('ipfsHash');
  const artistName = searchParams.get('artistname') || 'Unknown Artist';
  const artistPfp = searchParams.get('artistpfp');

  if (!ipfsHash && artistName && artistPfp) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          fontSize: 48,
          color: '#333',
          backgroundColor: '#f6f6f6',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Scratch of Art Project
      </div>,
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        fontSize: 24,
        color: '#333',
        backgroundColor: '#f6f6f6',
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '20px',
        gap: '20px',
      }}
    >
      {/* NFT Image */}
      <img
        src={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
        alt="NFT"
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '16px',
          objectFit: 'cover',
        }}
      />

      {/* Artist Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {artistPfp && (
          <img
            src={artistPfp}
            alt="Artist"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        )}
        <p style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold' }}>
          {artistName}
        </p>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
