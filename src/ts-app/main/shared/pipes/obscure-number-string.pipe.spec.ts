import { ObscureNumberStringPipe } from './obscure-number-string.pipe';

describe('ObscureNumberStringPipe', () => {
  it('create an instance', () => {
    const pipe = new ObscureNumberStringPipe();
    expect(pipe).toBeTruthy();
  });
});
