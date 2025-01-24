import { instance } from "@/lib/axios";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import React, { useEffect } from "react";
import { v7 as uuid } from "uuid";
import { z } from "zod";

type SuggestionsProps = {};

const Suggestions = () => {
  const [suggestions, setSuggestions] = React.useState([]);

  useEffect(() => {
    (async () => {
      const res = await instance("/chat/suggestions");

      console.log(res?.data);
    })();
  }, []);
  return <div>Suggestions</div>;
};

export default Suggestions;
