// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// @zip.js/zip.js needs TransformStream to be available
import streams from 'web-streams-polyfill/ponyfill/es2018';

global.TransformStream = streams.TransformStream;
