readMyJSON <- function(name) {
  if (file.exists(name))
    jsonlite::fromJSON(readLines(name))
  else
    character(0)
}

mapMyJSON <- function(json) {
  quietlyReadMyJSON <- quietly(readMyJSON)
  safelyReadMyJSON <- safely(quietlyReadMyJSON, otherwise = character(0))
  myJSON <- map(json, safelyReadMyJSON)
  trJSON <- myJSON %>% purrr::transpose() %>% magrittr::extract2('result') %>% 
    purrr::transpose() %>% magrittr::extract2('result') %>% extract2(1)
  if (length(trJSON) == 0) {
    return(data_frame('cals' = 0, 'minutes' = 0, name = NA))
  } else {
    return(trJSON)
  }
}

cleanExerciseNames <- function(name) {
  if (is.null(name)) { return(NULL) }
  if (is.na(name))   {return(NA)}
  name <- tolower(name)
  
  if (str_detect(name, 'jog'))      { return('cardio') } 
  if (str_detect(name, 'yoga'))     { return('yoga') }
  if (str_detect(name, 'train'))    { return('XT') }
  if (str_detect(name, 'danc'))     { return('dancing') }
  if (str_detect(name, 'stretch'))  { return('stretching') }
  else {return(name)}
}

calculateExPoints <- function(name, minutes) {
  if (is.null(name)) {
    return(0)
  } else if (is.na(name)) {
    return(0)
  } else if (minutes == 0) {
    return(0)
  } else if (name %in% c('jogging', 'dancing', 'SUP')) {
    return(minutes / 30)
  } else if (name == 'XT') {
    return(minutes / 15)
  } else if (name %in% c('yoga', 'stretching')) {
    return(minutes / 60)
  } else {
    return(0)
  }
}

calculateCalPoints <- function(calsRem) {
  # -1pt if not filled out
  if (is.null(calsRem)) {
    return(-1)
  # -1pt if not filled out
  } else if (is.na(calsRem)) {
    return(-1)
  # 1pt for ending with cals left or at 0
  } else if (calsRem >= 0) {
    return(1)
  # No points if within 300 cals of target
  } else if (calsRem < 0 & calsRem > -300) {
    return(0)
  # -1pt if over 300 over that day
  }  else if (calsRem < -300) {
    return(-1)
  } else {
    return(0)
  }
}

sanitizeNAs <- function(suspectedNA) {
  if (is.null(suspectedNA)) {
    return(character(0))
  } else if (is.na(suspectedNA)) {
    return(character(0))
  } else if (length(suspectedNA) == 0) {
    return(character(0))
  } else if (suspectedNA == "NA") {
    return(character(0))
  } else {
    return(suspectedNA)
  }
}
