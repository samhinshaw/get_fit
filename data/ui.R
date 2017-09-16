#
# This is the user-interface definition of a Shiny web application. You can
# run the application by clicking 'Run App' above
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

shinyUI(fluidPage(
  tags$head(
    tags$link(rel = "apple-touch-icon", sizes = "180x180", href = "/apple-touch-icon.png"),
      tags$link(rel = "icon", type = "image/png", sizes = "32x32", href = "/favicon-32x32.png"),
      tags$link(rel = "icon", type = "image/png", sizes = "16x16", href = "/favicon-16x16.png"),
      tags$link(rel = "manifest", href = "/manifest.json"),
      tags$link(rel = "mask-icon", href = "/safari-pinned-tab.svg", color = "#5bbad5"),
      tags$meta(name = "apple-mobile-web-app-title", content = "Fitness Tracker"),
      tags$meta(name = "application-name", content = "Fitness Tracker"),
      tags$meta(name = "theme-color", content = "#ffffff"),
    tags$link(rel = "stylesheet", type = "text/css", href = "styles.css"),
    tags$link(rel = "stylesheet", type = "text/css", href = "bootstrap.min.css")
  ),
  title = "Fitness Tracker",
  useShinyjs(),
  windowTitle = "Fitness Tracker",
  # Application title
  h1("Sam & Amelia's Fitness Tracker!"),
  uiOutput("ThisMondayFormatted"),
  tags$div(
    class = 'user-panel col-sm-6', 
    h2("Sam", class = "user-panel-title"),
    tags$div(
      id = "SamLastWeekHeader",
      class = 'panel panel-default', 
      tags$div(
        class = 'panel-heading',
        span(class = "panel-title main-panel-title", "Last Week"),
        span(
          class = "panel-title points-header",
          textOutput("SamTotalPointsLastWeek")
        )      ),
      tags$div(
        class = 'panel-body',
        # h3("Exercise"),
        # uiOutput("SamExerciseLastWeek"),
        # h3("Calories"),
        # uiOutput("SamCalsLastWeek"),
        # h3('Summary'),
        tableOutput("samLastWeek")
      )
    ),
    tags$div(
      id = "SamThisWeekHeader",
      class = 'panel panel-default', 
      tags$div(
        class = 'panel-heading',
        span(class = "panel-title main-panel-title", "This Week"),
        span(
          class = "panel-title points-header",
          textOutput("SamTotalPointsThisWeek")
        )
      ),
      tags$div(
        class = 'panel-body',
        # h3("Exercise"),
        # uiOutput("SamExerciseThisWeek"),
        # h3("Calories"),
        # uiOutput("SamCalsThisWeek"),
        # h3('Summary'),
        tableOutput("samThisWeek")
      )
    )
  ),
  tags$div(
    class = 'user-panel col-sm-6', 
    h2("Amelia", class = "user-panel-title"),
    tags$div(
      id = "AmLastWeekHeader",
      class = 'panel panel-default', 
      tags$div(
        class = 'panel-heading',
        span(class = "panel-title main-panel-title", "Last Week"),
        span(
          class = "panel-title points-header",
          textOutput("AmTotalPointsLastWeek")
        )      ),
      tags$div(
        class = 'panel-body',
        # h3("Exercise"),
        # uiOutput("AmExerciseLastWeek"),
        # h3("Calories"),
        # uiOutput("AmCalsLastWeek"),        
        # h3('Summary'),
        tableOutput("amLastWeek")
      )
    ),
    tags$div(
      id = "AmThisWeekHeader",
      class = 'panel panel-default', 
      tags$div(
        class = 'panel-heading',
        span(class = "panel-title main-panel-title", "This Week"),
        span(
          class = "panel-title points-header",
          textOutput("AmTotalPointsThisWeek")
        )
      ),
      tags$div(
        class = 'panel-body',
        # h3("Exercise"),
        # uiOutput("AmExerciseThisWeek"),
        # h3("Calories"),
        # uiOutput("AmCalsThisWeek"),
        # h3('Summary'),
        tableOutput("amThisWeek")
      )
    )
  )
))
