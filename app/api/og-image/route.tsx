import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ipfsHash = searchParams.get('ipfsHash');
  const artistName = searchParams.get('artistname') || 'Unknown Artist';
  const artistPfp = searchParams.get('artistpfp');

  const fontData = await fetch(
    new URL('../../fonts/Comic-Sans-MS.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  if (!ipfsHash && !artistName && !artistPfp) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            color: 'white',
            background: 'linear-gradient(to bottom right, #4f2d61, #2f1b3a)',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Comic Sans',
            fontWeight: 'normal',
          }}
        >
          Scratch of Art Project
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Comic Sans',
            data: fontData,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 24,
          color: 'white',
          background: 'linear-gradient(to bottom right, #4f2d61, #2f1b3a)',
          width: '100%',
          height: '100%',
          fontFamily: 'Comic Sans',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* NFT Image (Left) */}
        {ipfsHash && (
          <div
            style={{
              position: 'absolute',
              left: '-5%',
              top: '-5%',
              width: '60%',
              height: '110%',
              transform: 'skew(-10deg)',
              overflow: 'hidden',
            }}
          >
            <img
              src={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
              alt="NFT"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'skew(10deg) scale(1.2)',
              }}
            />
          </div>
        )}

        {/* Artist Image (Right) */}
        {artistPfp && (
          <div
            style={{
              position: 'absolute',
              right: '-5%',
              top: '-5%',
              width: '60%',
              height: '110%',
              transform: 'skew(-10deg)',
              overflow: 'hidden',
            }}
          >
            <img
              src={artistPfp}
              alt="Artist"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'skew(10deg) scale(1.2)',
              }}
            />
          </div>
        )}

        {/* Central Content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(47, 27, 58, 0.8)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'normal',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {artistName}
          </h1>
          <p
            style={{
              fontSize: '36px',
              fontWeight: 'normal',
              marginBottom: '20px',
            }}
          >
            Scratch of Art Project
          </p>
          <p
            style={{
              fontSize: '24px',
              fontWeight: 'normal',
              fontStyle: 'italic',
            }}
          >
            &quot;Where creativity meets chaos, and pixels party!&quot;
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Comic Sans',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}

