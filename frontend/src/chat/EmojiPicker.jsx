import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const emojiList = [
  // Smileys (first 40)
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',

  // Emotions (next 40)
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣️', '💕', '💞',
  '💓', '💗', '💖', '💘', '💝', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹',
  '💤', '💢', '💬', '👿', '😡', '😠', '🤬', '😤', '😈', '👹',
  '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '😺',

  // Gestures (next 60)
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👊', '👋', '🙏',
  '👏', '🙌', '🤲', '👐', '🤝', '✋', '🤚', '🖐️', '🖖', '👆',
  '👇', '👉', '👈', '🤙', '✍️', '🤳', '💪', '🦾', '🦵', '🦿',
  '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅',
  '👄', '🫦', '🫰', '🤏', '🫱', '🫲', '🫳', '🫴', '🫵', '🫶',
  '🫂', '🫃', '🫄', '🫠', '🫡', '🫢', '🫣', '🫤', '🫥', '🫨'
];

const categories = [
  { name: "Smileys", icon: "😀" },
  { name: "Emotions", icon: "❤️" },
  { name: "Gestures", icon: "👍" }
];

const EmojiPicker = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const pickerRef = useRef(null);

  const togglePicker = () => setIsOpen(prev => !prev);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getEmojisForCategory = (category) => {
    switch (category) {
      case "Smileys": return emojiList.slice(0, 40);
      case "Emotions": return emojiList.slice(40, 80);
      case "Gestures": return emojiList.slice(80);
      default: return emojiList;
    }
  };

  return (
    <div ref={pickerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label="Open emoji picker"
        onClick={togglePicker}
        style={{
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Smile size={22} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '12px',
            width: '288px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            padding: '12px'
          }}
        >
          {/* Category Buttons */}
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '10px' }}>
            {categories.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                aria-pressed={activeCategory === name}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: activeCategory === name ? '#e0e0ff' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: activeCategory === name ? '#0000cc' : '#555'
                }}
              >
                <div style={{ fontSize: '18px' }}>{icon}</div>
                <div style={{ fontSize: '12px' }}>{name}</div>
              </button>
            ))}
          </div>

          {/* Emojis */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {getEmojisForCategory(activeCategory).map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                aria-label={`Select emoji ${emoji}`}
                style={{
                  fontSize: '20px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
