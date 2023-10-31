import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Page = () => {
  const router = useRouter()
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  const handleClick = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/create-vote?id=${id}&type=ONCLICK&iteration=${questionNumber}`);
      const jsonResponse = await response.json();
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      setQuestionNumber(prevIteration => prevIteration + 1)
      setQuestion(jsonResponse);
      if (jsonResponse?.lastCount) {
        await fetch('/api/remove-votes?type=UPDATE');
        router.push('thankyou')
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setHasError({
        error: true,
        message: error.message
      });
    }
  };

  const getResults = async (id, type = '') => {
    const response = await fetch(`/api/create-vote?id=${id}&type=${type}&iteration=`);
    const result = await response.json();
    setQuestion(result);
  }
  useEffect(() => {
    async function fetchData() {
      await fetch(`/api/remove-votes?type=UPDATE`);
      await getResults('red', 'ONLOAD')
    }
    fetchData();
  }, []);

  return (
    <section className="border border-zinc-800 rounded-lg px-4 py-6 sm:p-8 max-w-3xl mx-auto">
      <div className="grid gap-4">
        <p className="flex justify-center m-0  text-sm sm:text-lg mb-2 sm:mb-4">
          What is favorite color?{' '} <b>Play below!</b>
        </p>
        <div className="grid gap-4 sm:gap-6 mb-2 sm:mb-4">
          {question?.options.map(option => <button
            key={option}
            className="flex justify-center font-bold border border-zinc-800 text-xs sm:text-sm rounded-full w-full overflow-hidden transition-colors duration-300 hover:bg-primary/10 hover:border-primary/20 disabled:bg-black disabled:cursor-not-allowed disabled:bg-orange-100"
            onClick={() => handleClick(option)}
            disabled={isSubmitting || hasError}
          >
            <span className="p-2 sm:p-3">{option}</span>
          </button>)}
        </div>
      </div>
    </section>
  );
};

export default Page;
