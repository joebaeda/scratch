import { scratchAbi, scratchAddress } from '@/lib/contracs/scratch';
import { ImageResponse } from 'next/og';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'edge';

// Helper to decode Base64 tokenURI and extract the image URL
const extractImageUrl = (base64Uri: string): string => {
  try {
    const json = JSON.parse(atob(base64Uri.split(',')[1])); // Decode Base64 and parse JSON
    return json.image || ''; // Return the image URL from the decoded JSON
  } catch (error) {
    console.error('Error decoding Base64 tokenURI:', error);
    return '';
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            color: 'white',
            background: 'linear-gradient(to bottom right, #4f2d61, #2f1b3a)',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Scratch of Art Project
        </div>
      ),
      {
        width: 402,
        height: 392,
      }
    );
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  try {
    const tokenURI: string = await publicClient.readContract({
      address: scratchAddress as `0x${string}`,
      abi: scratchAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    const imageUrl = extractImageUrl(tokenURI);

    if (!imageUrl) {
      throw new Error('Image URL not found in tokenURI');
    }

    const formattedUrl = imageUrl.startsWith('ipfs://')
      ? `https://gateway.pinata.cloud/ipfs/${imageUrl.slice(7)}`
      : imageUrl;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${formattedUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'scale(1.2)',
              maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)',
            }}
          />
        </div>
      ),
      {
        width: 402,
        height: 392,
      }
    );
  } catch (error) {
    console.error('Error fetching tokenURI or generating image:', error);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            color: 'white',
            background: 'linear-gradient(to bottom right, #4f2d61, #2f1b3a)',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Error Loading Token
        </div>
      ),
      {
        width: 402,
        height: 392,
      }
    );
  }
}

