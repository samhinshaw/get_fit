library(tidyverse)
library(magrittr)
library(jsonlite)
library(mongolite)

db <- mongo(
  collection = 'userInfo',
  db = 'get_fit',
  url = 'mongodb://localhost:27025/',
  verbose = TRUE
)

# convert to JSON as
# json <- toJSON(mtcars)

# insert with 
# db$insert(mtcars)


# find with
# mydata <- db$find()

# exit script by closing connection and forcing GC this is REALLY important,
# because we can't have two connections to the database at the same time!!
rm(con)
gc()
