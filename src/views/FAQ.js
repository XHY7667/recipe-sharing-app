import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'How do I search for recipes?',
    answer:
      'Use the search bar to type any recipe name or keyword. Suggestions will appear as you type, and full results will show on search.',
  },
  {
    question: 'Can I submit my own recipes?',
    answer:
      'Yes! Head to the Submit page, fill out the form (including a photo), and click Submit. Your recipe will appear in search and your personal list.',
  },
  {
    question: 'How do I create a shopping list?',
    answer:
      "On the Pantry Picker page, expand a recipe's ingredients and check the ones you need. They show up in your Shopping List where you can mark purchases.",
  },
  {
    question: 'What is Favorites?',
    answer:
      'Click the ♥ button on any recipe detail to favorite it. View and manage them in My Cookbook, neatly grouped by category.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      "Everything (your recipes, favorites, and shopping list) lives in your browser's localStorage—so it stays across sessions on this device.",
  },
  {
    question: 'The Reference?',
    answer: `Images:
  Wix.com. (n.d.). Background and UI images [Digital images]. Retrieved April 29, 2025, from https://www.wix.com
  API:
  TheMealDB. (n.d.). TheMealDB API [API]. Retrieved April 29, 2025, from https://www.themealdb.com/api.php
  Frameworks & Libraries:
  - React
  - React Router
  - Axios`,
  }
];

export default function FAQ() {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitted(true);
    setQuestion('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div id="faq-view">
      <h1>Frequently Asked Questions</h1>
      <dl>
        {faqs.map((item, i) => (
          <React.Fragment key={i}>
            <dt className="faq-q">{item.question}</dt>
            <dd className="faq-a">{item.answer}</dd>
          </React.Fragment>
        ))}
      </dl>

      <form id="faq-submit" onSubmit={handleSubmit}>
        <h2>Have a Question?</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          rows={3}
        />
        <button type="submit">Submit Question</button>
        {submitted && <p className="thank-you">Thanks for your question!</p>}
      </form>
    </div>
  );
}
