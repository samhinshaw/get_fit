#
# This is the server logic of a Shiny web application. You can run the 
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

shinyServer(function(input, output, session) {
  
  output$ThisMondayFormatted <- renderUI({
    HTML("This is the week of ", format(ThisMonday, '%A, %B %d, %Y'))
  })
  
  ########################
  #                      #
  #       This Week      #
  #                      #
  ########################
  
  output$SamTotalPointsThisWeek <- renderText({
    totalPoints <- sam_points_summary %>% filter(week == 'thisWeek') %>% 
      extract2('points')
      if (totalPoints == 1) {
        paste0(totalPoints, " pt")
      } else {
        paste0(totalPoints, " pts")
      }
  })
  
  output$AmTotalPointsThisWeek <- renderText({
    totalPoints <- am_points_summary %>% filter(week == 'thisWeek') %>% 
      extract2('points')
    if (totalPoints == 1) {
      paste0(totalPoints, " pt")
    } else {
      paste0(totalPoints, " pts")
    }
  })
  
  ########################
  #                      #
  #       Last Week      #
  #                      #
  ########################
  
  output$SamTotalPointsLastWeek <- renderText({
    totalPoints <- sam_points_summary %>% filter(week == 'lastWeek') %>% 
      extract2('points')
    if (totalPoints == 1) {
      paste0(totalPoints, " pt")
    } else {
      paste0(totalPoints, " pts")
    }
  })
  
  output$AmTotalPointsLastWeek <- renderText({
    totalPoints <- am_points_summary %>% filter(week == 'lastWeek') %>% 
      extract2('points')
    if (totalPoints == 1) {
      paste0(totalPoints, " pt")
    } else {
      paste0(totalPoints, " pts")
    }
  })
  
  ###############################
  #                             #
  #        Summary Tables       #
  #                             #
  ###############################
  
  
  output$samThisWeek <- renderTable({
    samDisplayThisWeek
  }, na = '', digits = 0,
  sanitize.text.function = function(x) x)
  
  output$amThisWeek <- renderTable({
    amDisplayThisWeek
  }, na = '', digits = 0,
  sanitize.text.function = function(x) x)
  
  output$samLastWeek <- renderTable({
    samDisplayLastWeek
  }, na = '', digits = 0,
  sanitize.text.function = function(x) x)
  
  output$amLastWeek <- renderTable({
    amDisplayLastWeek
  }, na = '', digits = 0,
  sanitize.text.function = function(x) x)
  
  
  ##############################################
  #                                            #
  #        Color-Coding Based on Success       #
  #                                            #
  ##############################################
  
  #### Sam ######
  
  # This Week
  
  removeCssClass(id = "SamThisWeekHeader", class = "panel-default")
  
  if (SamTotalPointsThisWeek >= 17) {
    addCssClass(id = "SamThisWeekHeader", class = "panel-success")
  } else if (SamTotalPointsThisWeek > 12  & SamTotalPointsThisWeek < 17) {
    addCssClass(id = "SamThisWeekHeader", class = "panel-primary")
  } else if (SamTotalPointsThisWeek < 12  & SamTotalPointsThisWeek > 10) {
    addCssClass(id = "SamThisWeekHeader", class = "panel-warning")
  } else if (SamTotalPointsThisWeek < 10) {
    addCssClass(id = "SamThisWeekHeader", class = "panel-danger")
  } 
  
  
  # Last Week
  removeCssClass(id = "SamLastWeekHeader", class = "panel-default")
  
  if (SamTotalPointsLastWeek >= 17) {
    addCssClass(id = "SamLastWeekHeader", class = "panel-success")
  } else if (SamTotalPointsLastWeek > 12  & SamTotalPointsLastWeek < 17) {
    addCssClass(id = "SamLastWeekHeader", class = "panel-primary")
  } else if (SamTotalPointsLastWeek < 12  & SamTotalPointsLastWeek > 10) {
    addCssClass(id = "SamLastWeekHeader", class = "panel-warning")
  } else if (SamTotalPointsLastWeek < 10) {
    addCssClass(id = "SamLastWeekHeader", class = "panel-danger")
  } 
  
  #### Amelia ######
  
  # This Week
  
  removeCssClass(id = "AmThisWeekHeader", class = "panel-default")
  
  if (AmTotalPointsThisWeek >= 17) {
    addCssClass(id = "AmThisWeekHeader", class = "panel-success")
  } else if (AmTotalPointsThisWeek > 12  & AmTotalPointsThisWeek < 17) {
    addCssClass(id = "AmThisWeekHeader", class = "panel-primary")
  } else if (AmTotalPointsThisWeek < 12  & AmTotalPointsThisWeek > 10) {
    addCssClass(id = "AmThisWeekHeader", class = "panel-warning")
  } else if (AmTotalPointsThisWeek < 10) {
    addCssClass(id = "AmThisWeekHeader", class = "panel-danger")
  } 
  
  
  # Last Week
  removeCssClass(id = "AmLastWeekHeader", class = "panel-default")
  
  if (AmTotalPointsLastWeek >= 17) {
    addCssClass(id = "AmLastWeekHeader", class = "panel-success")
  } else if (AmTotalPointsLastWeek > 12  & AmTotalPointsLastWeek < 17) {
    addCssClass(id = "AmLastWeekHeader", class = "panel-primary")
  } else if (AmTotalPointsLastWeek < 12  & AmTotalPointsLastWeek > 10) {
    addCssClass(id = "AmLastWeekHeader", class = "panel-warning")
  } else if (AmTotalPointsLastWeek < 10) {
    addCssClass(id = "AmLastWeekHeader", class = "panel-danger")
  } 
  
  
  # 
  # 
  # output$pastMondayFormatted <- renderUI({
  #   HTML(paste0("<h4>Last week (", format(pastMonday, '%A, %B %d, %Y'), ")</h4>"))
  # })
  # 
  # 
  # output$AmountWorkedLastWeek <- renderText(paste0("Last week, ", AmountWorkedLastWeek))
  # 
  # output$RewardsLastWeek <- renderText(RewardsLastWeek)
  # 
  # 
  # output$SevenDayAverage <- renderText(paste0("<b>Your current seven day average is ", SevenDayAverage, " lbs.</b>"))
  # 
  # 
  # output$WeightLastWeek <- renderText(paste0("Your average weight last week was ", WeightLastWeek, " lbs."))
  # 
  # 
  # output$DateOfHitting160 <- renderUI({
  #   HTML(c("At this rate, you will hit 160lbs on ", print(format(DateOfHitting160, '%A, %B %d, %Y'))))
  # })
  # 
  # RateOfWeight <- if(lossPerWeek < 0){
  #   paste0("You're losing weight at a rate of ", lossPerWeek, " pounds per week (", 
  #          lossPerMonth, " pounds per month).")
  # } else{
  #   paste0("You're GAINING weight at a rate of ", lossPerWeek, " pounds per week (", 
  #          lossPerMonth, " pounds per month).")
  # }
  # 
  # output$RateOfWeight <- renderText(RateOfWeight)
  # 
  # ListOfChores <- if (SevenDayAverage >= 175){
  #   paste0("You're getting there slowly but surely.<br>", 
  #          "Your responsibilities are as follows:",
  #          "<ul>",
  #          "<li>Do all of the dishes (2pts)</li>", 
  #          "<li>Do all of the laundry (1 pt)</li>",
  #          "<li>Take out all of the trash & recycling (1 pt)</li>", 
  #          "<li>Make dinner whenever Amelia wants it (2 pts)</li>", 
  #          "<li>Redd up apartment whenever Amelia wants it (1 pt)</li>", 
  #          "<li>Weekday grocery trips whenever Amelia wants it (2 pts)</li>", 
  #          "<li>Massages whenever Amelia wants them (1 pt)", 
  #          "</ul>"
  #   )
  # } else if(SevenDayAverage <= 175 & SevenDayAverage >= 170){
  #   paste0("You hit your first milestone, congratulations!!!<br>", 
  #          "<strong>YOU GET A NAUGHTY NIGHT!!</strong> Amelia picks the rules and rewards.<br>",
  #          "Your responsibilities are as follows:", 
  #          "<ul>",
  #          "<li>Do all of the dishes (2 pts)</li>", 
  #          "<li>Do all of the laundry (1 pt)</li>",
  #          "<li>Take out all of the trash & recycling (1 pt)</li>", 
  #          "<li>Make dinner whenever Amelia wants it (2 pts)</li>", 
  #          "<li>Weekday grocery trips whenever Amelia wants it (1 pt)</li>", 
  #          "<li>30min massage once a week (1 pt)", 
  #          "</ul>"
  #   )
  # } else if(SevenDayAverage <= 170 & SevenDayAverage >= 165){
  #   paste0("You hit your <strong>second</strong> milestone, congratulations!!!<br>", 
  #          "**YOU GET A NAUGHTY NIGHT!!** You get to pick the rules and rewards this time around!<br>",
  #          "Your list of responsibilities is getting smaller!!",
  #          "<ul>",
  #          "<li>Do all of the dishes (2 pts)</li>", 
  #          "<li>Do all of the laundry (1 pt)</li>",
  #          "<li>Take out all of the trash & recycling (1 pt)</li>", 
  #          "<li>Make dinner whenever Amelia wants it (1 pt)</li>", 
  #          "</ul>"
  #   )
  # } else if(SevenDayAverage <= 165 & SevenDayAverage >= 160){
  #   paste0("You hit your <strong>third</strong> milestone, congratulations!!!<br>", 
  #          "**YOU GET A NAUGHTY NIGHT!!** Amelia picks the rules and rewards this time around<br>",
  #          "Your list of responsibilities is getting smaller!!",
  #          "<ul>",
  #          "<li>Do all of the dishes (2 pts)</li>", 
  #          "<li>Do all of the laundry (1 pt)</li>",
  #          "<li>Take out all of the trash & recycling (1 pt)</li>", 
  #          "</ul>"
  #   )
  # } else if(SevenDayAverage <= 160){
  #   paste0("YOU DID IT!!!!!<br>", 
  #          "<strong>One final naughty night...</strong> In celebration, you get to pick all the rules and rewards.<br>",
  #          "All responsibilities are now shared!!<br>", 
  #          "Now your final goal is to get a TONED ABS. You get one naughty night a month so long as you maintain your sexy abs."
  #   )
  # }
  # 
  # output$ListOfChores <- renderText(ListOfChores)
  # 
  # # Chunk to make graph pretty
  # 
  # # Quickly make pretty tickmarks for plot
  # ticks <- pretty_dates(rollingMeans$date, 4) # wait, I don't think this worked. Let's try with lubridate
  # Mondays <- rollingMeans %>% 
  #   filter((wday(date, label = TRUE) == "Mon")) %>% 
  #   select(date)
  # 
  # # Set ylims
  # MyAxisLimits <- c(155, 190)
  # 
  # # Create string to show weight loss per week
  # LossPerWeekPretty <- paste0(lossPerWeek, " lbs/week")
  # XSpotForLabel <- rollingMeans$date %>% as.numeric() %>% quantile(0.75) %>% as.Date()
  # YSpotForLabel <- 186.5
  # 
  # 
  # 
  # 
  # output$weightPlot <- renderPlot({
  #   
  #   ggplot(rollingMeans) +
  #     geom_point(aes(x = date, y = weight), shape = 15, size = 3) + 
  #     geom_line(aes(x = date, y = weight)) +
  #     geom_point(aes(x = date, y = weight.7), color = "#9999FF", shape = 19, size = 3, alpha = 0.5) +
  #     geom_line (aes(x = date, y = weight.7), color = "#9999FF",                       alpha = 0.5) +
  #     geom_hline(yintercept = 190, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 185, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 180, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 175, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 170, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 165, linetype = 1, alpha = 0.5) +
  #     geom_hline(yintercept = 160, linetype = 1, alpha = 0.5, size = 2) +
  #     geom_hline(yintercept = 155, linetype = 1, alpha = 0.5) +
  #     annotate("rect", fill = "#9999FF", xmin = XSpotForLabel - 3.7, xmax = XSpotForLabel + 3.7, 
  #              ymin = YSpotForLabel - 1.5, ymax = YSpotForLabel + 1.5, alpha = 0.5) +
  #     annotate("text", x = XSpotForLabel, y = 186.5, label = LossPerWeekPretty) +
  #     geom_smooth(aes(x = date, y = weight), method = "lm", se = FALSE, color = "#ff7070", size = 1, alpha = 0.5) +
  #     # geom_abline(intercept = linIntercept, slope = linSlope, color = "#ff7070") +
  #     ggtitle("Weight Loss Since Sept 2016") +
  #     xlab("Date") + ylab("Weight (lbs)") +
  #     scale_y_continuous(limits = MyAxisLimits, breaks = seq(from = min(MyAxisLimits), to = max(MyAxisLimits), by = 5)) +
  #     # scale_x_date(breaks = Mondays$date, date_labels = "%b %d") +
  #     theme(
  #       axis.text.x = element_text()#angle = 45, hjust = 1)
  #     ) + 
  #     theme_minimal()
  #   
  # })

})
