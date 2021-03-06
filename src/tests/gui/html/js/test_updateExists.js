import GitHub from 'github-api/dist/GitHub.bundle.min';
import updateExists from '../../../../gui/html/js/updateExists.js';

jest.mock('github-api/dist/GitHub.bundle.min', () =>
  jest.fn().mockImplementation(() => ({
    getRepo: jest.fn().mockImplementation(() => ({
      getRelease: jest.fn().mockReturnValue(
        Promise.resolve({
          data: {
            tag_name: '0.9.2'
          }
        })
      ),
      listTags: jest.fn().mockReturnValue(
        Promise.resolve({
          data: [
            {
              name: '0.9.2',
              commit: {
                sha: '6b58f92a5d41f5d7f149a1263dac78687a065ff5'
              }
            },
            {
              name: '0.9.1',
              commit: {
                sha: 'dc24e10a4774903ede4e94165e7d6fa806466e4a'
              }
            },
            {
              name: '0.9.0',
              commit: {
                sha: '44a0d8505d5402dd24cf0fda9540da9557866c80'
              }
            }
          ]
        })
      ),
      getCommit: jest.fn().mockReturnValue(
        Promise.resolve({
          data: {
            committer: {
              date: '2011-04-14T16:00:49Z'
            }
          }
        })
      ),
      getSingleCommit: jest.fn().mockImplementation(ref =>
        Promise.resolve({
          data: {
            commit: {
              committer: {
                date:
                  ref === 'deadbeef'
                    ? '2011-04-14T16:00:00Z'
                    : '2011-04-14T16:00:49Z'
              }
            }
          }
        })
      )
    }))
  }))
);

describe('updateExists()', () => {
  beforeEach(() => {
    GitHub.mockClear();
  });

  test('should reject if no arguments are passed', () =>
    updateExists().catch(error =>
      expect(error).toEqual(
        new Error('Invalid arguments, both version and build must be given')
      )
    ));

  test('should reject if one argument is passed', () =>
    updateExists('1.0.0').catch(error =>
      expect(error).toEqual(
        new Error('Invalid arguments, both version and build must be given')
      )
    ));

  test('should reject if passed a version number has less than three parts', () =>
    updateExists('1.0', 'deadbeef').catch(error =>
      expect(error).toEqual(
        new Error('versions to compare are of unexpected format: 1.0, 0.9.2')
      )
    ));

  test('should reject if passed a version number has more than three parts', () =>
    updateExists('1.0.0.0', 'deadbeef').catch(error =>
      expect(error).toEqual(
        new Error(
          'versions to compare are of unexpected format: 1.0.0.0, 0.9.2'
        )
      )
    ));

  test('should reject if the version number given contains non-digit, non-period characters', () =>
    updateExists('1.0a.0', 'deadbeef').catch(error =>
      expect(error).toEqual(
        new Error('versions to compare are of unexpected format: 1.0a.0, 0.9.2')
      )
    ));

  test('should resolve to true if the given version is less than the latest version', () =>
    updateExists('0.9.1', 'deadbeef').then(result =>
      expect(result).toBe(true)
    ));

  test('should resolve to false if the given version is greater than the latest version', () =>
    updateExists('0.10.0', 'deadbeef').then(result =>
      expect(result).toBe(false)
    ));

  test('should resolve to true if the given version equals the latest version but the short build SHAs are unequal and the latest version commit is newer', () =>
    updateExists('0.9.2', 'deadbeef').then(result =>
      expect(result).toBe(true)
    ));

  test('should resolve to false if the given version equals the latest version but the short build SHAs are unequal and the build commits dates are equal', () =>
    updateExists('0.9.2', 'feedbac').then(result =>
      expect(result).toBe(false)
    ));

  test('should resolve to false if the given version equals the latest version and the short build SHAs are equal', () =>
    updateExists('0.9.2', '6b58f92').then(result =>
      expect(result).toBe(false)
    ));
});
