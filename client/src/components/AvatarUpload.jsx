import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPhoto } from '../api/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Circular photo picker with an instant local preview.
 * - If `token` is provided, the file uploads to Cloudinary immediately and `onUploaded(url)` fires.
 * - If not (e.g. Signup, before the account/token exist), only `onFileSelected(file)` fires —
 *   the caller uploads it later once a token is available.
 */
export default function AvatarUpload({ token, initials, value, onUploaded, onFileSelected, size = 'lg' }) {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setPreview(value); }, [value]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');

    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);
    if (!token) return;

    setUploading(true);
    try {
      const url = await uploadPhoto(file, token);
      onUploaded?.(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <Avatar size={size} className={cn('size-20 cursor-pointer', uploading && 'opacity-60')} onClick={() => inputRef.current?.click()}>
        {preview ? <AvatarImage src={preview} /> : <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>}
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-accent text-accent-foreground shadow-sm"
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
