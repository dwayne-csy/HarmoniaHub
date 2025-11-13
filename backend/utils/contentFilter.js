// backend/utils/contentFilter.js
const Filter = require('bad-words');

class ContentFilter {
  constructor() {
    this.filter = new Filter({
      placeHolder: '•',
      emptyList: false
    });
    
    // Combined bad words list (English + Tagalog)
    this.badWords = [
      // Tagalog bad words
      'putangina', 'puta', 'gago', 'tangina', 'bobo', 'ulol', 
      'lintik', 'hayop', 'pakyu', 'burat', 'tite', 'pekpek', 
      'kantot', 'letche', 'siraulo', 'pakshet', 'tarantado', 
      'punyeta', 'walang hiya', 'bwisit', 'yawa', 'peste', 
      'hindot', 'suso',
      
      // English bad words
      'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 
      'pussy', 'cock', 'cunt', 'whore', 'slut', 'damn', 
      'hell', 'crap', 'piss', 'dickhead', 'motherfucker', 
      'son of a bitch', 'bullshit', 'jerk'
    ];
    
    // Add all custom words to filter
    this.filter.addWords(...this.badWords);
    
    console.log(`Content filter initialized with ${this.badWords.length} bad words`);
  }

  // Filter text and return comprehensive results
  filterText(text) {
    if (!text || typeof text !== 'string') {
      return {
        original: text,
        filtered: text,
        hasProfanity: false,
        profanityCount: 0,
        flaggedWords: []
      };
    }

    const filtered = this.filter.clean(text);
    const hasProfanity = this.filter.isProfane(text);
    const flaggedWords = this.getFlaggedWords(text);

    return {
      original: text,
      filtered: filtered,
      hasProfanity: hasProfanity,
      profanityCount: flaggedWords.length,
      flaggedWords: flaggedWords,
      isFlagged: hasProfanity
    };
  }

  // Check if text contains profanity
  containsProfanity(text) {
    return this.filter.isProfane(text);
  }

  // Get list of flagged words found in text
  getFlaggedWords(text) {
    if (!text || typeof text !== 'string') return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const flaggedWords = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord && this.filter.isProfane(cleanWord)) {
        flaggedWords.push(cleanWord);
      }
    });
    
    return [...new Set(flaggedWords)];
  }

  // Get all bad words in the filter
  getBadWordsList() {
    return this.badWords;
  }
}

module.exports = new ContentFilter();