const fs = require('fs');

function getTermsFromFile(path) {
  let termsAsStringFromFile = fs.readFileSync(path, { encoding: 'utf8' });
  termsAsStringFromFile = termsAsStringFromFile.replace(/(\r?\n){2,}/g, '');
  termsAsStringFromFile = termsAsStringFromFile.replace(/[ ]{2,}/g, ' ');
  let termsArray = termsAsStringFromFile.split(/\r?\n/);
  const termsArrayValid = termsArray.reduce((acc, term) => {
    if (term !== '') {
      term.trim();
      const termLower = term.toLowerCase();
      acc.push(termLower);
    }
    return acc;
  }, []);
  const uniqueArray = [...new Set(termsArrayValid)];
  return uniqueArray;
}

function handleList(list, user) {
  const terms = getTermsFromFile(list.termsPath);
  let termOptions = list.termOptions;

  console.log('\x1b[33m%s\x1b[0m', 'Term Options:'); // font yellow
  console.log(termOptions);

  termOptions = setOptionsForFilterResults(user, termOptions);

  const query = terms.map((term) => {
    return {
      term,
      termOptions,
    };
  });

  return query;
}

function mergeAllListsQueries(lists, user) {
  const listQueries = [];

  for (const list of lists) {
    const query = handleList(list, user);
    listQueries.push(...query);
  }

  return listQueries;
}

function getListQueriesForUser(user, options) {
  try {
    const { userDirectory } = user;
    const listQueriesPath =
      options.listQueriesPath || `${userDirectory}\\listsQueries\\lists.js`;
    const lists = require(listQueriesPath);
    const listQueries = mergeAllListsQueries(lists, user);
    return listQueries;
  } catch (err) {
    throw err;
  }
}

function setOptionsForFilterResults(user, termOptions) {
  const {
    defaultMinViews,
    defaultMinRating,
    globalExcludeWords = [],
    videosLength,
    onlyRuLang = false,
  } = user;

  return {
    minViews: defaultMinViews,
    minRating: defaultMinRating,
    globalExcludeWords,
    videosLength,
    onlyRuLang,
    ...termOptions,
  };
}

module.exports = getListQueriesForUser;
