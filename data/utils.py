"""Utility functions for python data management."""
import re


def query_exercise_group(username, exercise_name, database) -> 'Dict[str, str]':
  """Get a nicely formatted exercise group 
  
  :param username: Username of the Get Fit username
  :type username: str
  :param exercise_name: Name of the exercise you're looking for
  :type exercise_name: str
  :param database: The MongoDB database connection you're using
  :type database: MongoClient
  :return: A dictionary containing the username and the exerciseGroup as a nested dictionary.
  :rtype: Dict[str, str]
  """

  exercise_group = database.users.aggregate(
    [
      # Query the documents
      {
        "$match":
          {
            "username": username,
            "exerciseGroups.exercises": {
              "$regex": exercise_name
            }
          }
      },
      # De-normalize??
      {
        "$unwind": "$exerciseGroups"
      },
      {
        "$unwind": "$exerciseGroups.exercises"
      },
      # Filter the actual array elements as desired
      {
        "$match": {
          "exerciseGroups.exercises": {
            "$regex": exercise_name
          }
        }
      },
      # Group the intermediate result
      {
        "$group":
          {
            "_id": {
              "username": "$username"
            },
            "exerciseGroup": {
              "$push": "$exerciseGroups"
            }
          }
      },
      {
        "$unwind": "$exerciseGroup"
      },
      # Group the final result
      {
        "$group": {
          "_id": "$_id.username",
          "exerciseGroup": {
            "$push": "$exerciseGroup"
          }
        }
      },
      {
        "$unwind": "$exerciseGroup"
      }
    ]
  )
  return exercise_group


def generate_substrings(string, min_length=3, escape=False) -> 'List[str]':
  """Generate substrings of a given string.
  
  :param string: The string you wish to generate substrings of.
  :type string: str
  :param min_length: The minimum length of strings you wish to generate. Default: 3.
  :type min_length: int
  :param escape: Whether or not you wish to escape any special characters. Relevant if you wish to use regex downstream with these substrings. Defaults to False.
  :type escape: bool
  :return: A list of substrings
  :rtype: List[str]
  """
  # A dictionary to hold our matches. Our dictionary will be indexed by the substring length.
  all_matches = {}
  # get our string length (for pretty variables)
  string_length = len(string)
  # We need to subtract one from our minimum length to get the minimum index
  # we'll be using (due to zero-indexing). So if we have a min length of 3, our
  # first_index will be 2, because subsetting at [2] is the third position.
  first_index = min_length - 1
  # for each length of string we want to generate, starting from the complete string...
  for substr_length in range(string_length, first_index, -1):
    # array (sorry, list!) to hold our substrings of a given length
    matches_for_length = []
    # start of the substring is the beginning of the string
    start_index = 0
    # end of the substring is the substr length
    end_index = substr_length
    # Now, we have to start from each position in the string that is valid.
    # Iterate through until we hit the end of the full string
    while end_index <= string_length:
      # create a slice
      indices = slice(start_index, end_index)
      # subset the string by that slice
      substring = string[indices]
      # escape the string for regex later on if specified
      if escape:
        substring = re.escape(substring)
      # append the substring to the list for this length string matches
      matches_for_length.append(substring)
      # Move our start & end indices for our next substring
      start_index += 1
      end_index += 1

    # Create a dictionary entry named as the substring length for all our
    # matches of that length.
    all_matches[substr_length] = matches_for_length

  return all_matches
